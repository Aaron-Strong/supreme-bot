require('electron-connect').client.create() // Live Reloads

var { ipcRenderer } = require('electron');

var buttonElement = document.querySelector('#start');
buttonElement.addEventListener('click', function () {
    ipcRenderer.send('start-scrape');
});

ipcRenderer.on('scrape-reply', (event, products) => {
    console.log("Got a reply!!!")
    var root = document.querySelector('#scraped')
    var finishedHeader = document.createElement("h1")
    var finishedHeaderText = document.createTextNode("Scraping Finished!")
    finishedHeader.appendChild(finishedHeaderText)
    root.appendChild(finishedHeader)
    for (var i = 0; i < products.length; i++) {
        products[i].index = i;
        var containerDiv = document.createElement("div")
        root.appendChild(containerDiv);

        var img = document.createElement("img");
        img.setAttribute('src', products[i].img);
        img.setAttribute('alt', 'na');
        img.setAttribute('height', '100px');
        img.setAttribute('width', '100px');
        img.className += 'img-thumbnail'
        containerDiv.appendChild(img);


        var name = document.createElement("h3");
        var nameText = document.createTextNode(products[i].name)
        name.appendChild(nameText)
        containerDiv.appendChild(name)

        var model = document.createElement("h3");
        var modelText = document.createTextNode(products[i].model);
        model.appendChild(modelText);
        containerDiv.appendChild(model);

        var link = document.createElement("a");
        var linkText = document.createTextNode(products[i].link);
        link.appendChild(linkText);
        link.title = products[i].link
        link.href = products[i].link
        containerDiv.appendChild(link)

        var buyButton = document.createElement("button");
        buyButton.innerHTML = "Buy Now";
        buyButton.onclick = (function (i) {
            return function () {
                products[i]
                console.log(products[i].link);
                ipcRenderer.send('buy-item', products[i].link);
            };
        }(i));
        buyButton.className += "btn btn-primary"
        containerDiv.appendChild(buyButton)
        var hr = document.createElement("hr")
        containerDiv.appendChild(hr)
    }
})

ipcRenderer.on('bought-item', (event, msg) => {
    console.log("Finsihed buying item")
    console.log(msg)
    alert("Item may or may not have been bought\nMaybe we'll know when i add error handling :S")
});