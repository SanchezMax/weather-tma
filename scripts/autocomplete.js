function addressAutocomplete(containerElement, callback, options) {
    // create container for input element
    const inputContainerElement = document.createElement("div");
    inputContainerElement.setAttribute("class", "input-container");
    containerElement.appendChild(inputContainerElement);

    // create input element
    const inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("placeholder", options.placeholder);
    inputContainerElement.appendChild(inputElement);

    // add input field clear button
    const clearButton = document.createElement("div");
    clearButton.classList.add("clear-button");
    addIcon(clearButton);
    clearButton.addEventListener("click", (e) => {
        e.stopPropagation();
        inputElement.value = '';
        callback(null);
        clearButton.classList.remove("visible");
        closeDropDownList();
    });
    inputContainerElement.appendChild(clearButton);

    const MIN_ADDRESS_LENGTH = 3;
    const DEBOUNCE_DELAY = 300;

    /* Current autocomplete items data */
    let currentItems;

    let currentTimeout;
    let currentPromiseReject;

    /* Process a user input: */
    inputElement.addEventListener("input", function (e) {
        const currentValue = this.value;

        if (!currentValue) {
            clearButton.classList.remove("visible");
        }

        // Show clearButton when there is a text
        clearButton.classList.add("visible");

        // Cancel previous timeout
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }

        // Cancel previous request promise
        if (currentPromiseReject) {
            currentPromiseReject({
                canceled: true
            });
        }

        // Skip empty or short address strings
        if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
            return false;
        }

        /* Call the Address Autocomplete API with a delay */
        currentTimeout = setTimeout(() => {
            currentTimeout = null;

            /* Create a new promise and send geocoding request */
            const promise = new Promise((resolve, reject) => {
                currentPromiseReject = reject;

                const apiKey = "d6d88f4784fe469cb553ca5a0057baa8"; // Your GeoApify API key here

                const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&type=city&format=json&limit=5&apiKey=${apiKey}`;

                fetch(url)
                    .then(response => {
                        currentPromiseReject = null;

                        // check if the call was successful
                        if (response.ok) {
                            response.json().then(data => resolve(data));
                        } else {
                            response.json().then(data => reject(data));
                        }
                    });
            });

            promise.then((data) => {
                closeDropDownList(); // ?
                // here we get address suggestions
                currentItems = data.results;

                /*create a DIV element that will contain the items (values):*/
                const autocompleteItemsElement = document.createElement("div");
                autocompleteItemsElement.setAttribute("class", "autocomplete-items");
                inputContainerElement.appendChild(autocompleteItemsElement);

                /* For each item in the results */
                data.results.forEach((result, index) => {
                    /* Create a DIV element for each element: */
                    const itemElement = document.createElement("div");
                    /* Set formatted address as item value */
                    itemElement.innerHTML = result.formatted;
                    autocompleteItemsElement.appendChild(itemElement);

                    /* Set the value for the autocomplete text field and notify: */
                    itemElement.addEventListener("click", function (e) {
                        inputElement.value = currentItems[index].formatted;
                        callback(currentItems[index]);
                        /* Close the list of autocompleted values: */
                        closeDropDownList();
                    });
                });
            }, (err) => {
                if (!err.canceled) {
                    console.log(err);
                }
            });
        }, DEBOUNCE_DELAY);
    });

    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    let focusedItemIndex;

    /* Add support for keyboard navigation */
    inputElement.addEventListener("keydown", function (e) {
        let autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
        if (autocompleteItemsElement) {
            let itemElements = autocompleteItemsElement.getElementsByTagName("div");
            if (e.code == 40) {
                e.preventDefault();
                /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
                focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.code == 38) {
                e.preventDefault();

                /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
                focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.code == 13) {
                /* If the ENTER key is pressed and value as selected, close the list*/
                e.preventDefault();
                if (focusedItemIndex > -1) {
                    closeDropDownList();
                }
            }
        } else {
            if (e.code == 40) {
                /* Open dropdown list again */
                let event = new Event('input', { bubbles: true, cancelable: true });
                inputElement.dispatchEvent(event);
            }
        }
    });

    function setActive(items, index) {
        if (!items || !items.length) return false;

        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }

        /* Add class "autocomplete-active" to the active element*/
        items[index].classList.add("autocomplete-active");

        // Change input value and notify
        inputElement.value = currentItems[index].formatted;
        callback(currentItems[index]);
    }

    function closeDropDownList() {
        let autocompleteItemsElement = inputContainerElement.querySelector(".autocomplete-items");
        if (autocompleteItemsElement) {
            inputContainerElement.removeChild(autocompleteItemsElement);
        }
        focusedItemIndex = -1;
    }

    function addIcon(buttonElement) {
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('viewBox', "0 0 24 24");
        svgElement.setAttribute('height', "24");

        const iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        iconElement.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
        iconElement.setAttribute('fill', 'currentColor');
        svgElement.appendChild(iconElement);
        buttonElement.appendChild(svgElement);
    }

    /* Close the autocomplete dropdown when the document is clicked. 
      Skip, when a user clicks on the input field */
    document.addEventListener("click", function (e) {
        if (e.target !== inputElement) {
            closeDropDownList();
        } else if (!containerElement.querySelector(".autocomplete-items")) {
            // open dropdown list again
            let event = new Event('input', { bubbles: true, cancelable: true });
            inputElement.dispatchEvent(event);
        }
    });
}

/**
 * Show or hide the main page depending on current state
 */

function toggleShowAutocomplete() {
    let el = document.getElementById('autocomplete-container')
    if (el.classList.contains('hidden')) {
        let inputElement = document.querySelector('input');
        inputElement.value = '';
        setTimeout(function () {
            el.style.display = ''
        }, 300);
        setTimeout(function () {
            el.classList.remove('hidden')
        }, 600);
    } else {
        el.classList.add('hidden')
        setTimeout(function () {
            el.style.display = 'none'
        }, 300);
    }
}

addressAutocomplete(document.getElementById("autocomplete-container"), (data) => {
    getWeather(data["city"]);
    cityToSave = data["city"]
    togglePage()
}, {
    placeholder: "Start typing the city name"
});