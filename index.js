// Tool to scrape and purchase the latest releases on http://www.supremenewyork.com
// Created by Mooku<admin@brutality.io>

var vo = require('vo')
var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true
});

var getProductsBasic = function* () {
    var productsInstock = yield nightmare
        .goto("http://www.supremenewyork.com/shop/new")
        .wait('body')
        .evaluate(function () {
            var products = document.getElementsByTagName("article") // Each item on supreme's shop is wrapped in an <article> tag
            var productsFormated = []                               // making it super easy to scrape data with.
            for (var i = 0; i < products.length; i++) {             // However the product name is hidden till you click the href.
                var productLink = products[i].querySelector('a').href
                var productImg = products[i].querySelector('img').src
                var inStock = (products[i].getElementsByClassName('sold_out_tag').length == 0)
                productsFormated.push({ index: i, link: productLink, img: productImg, inStock: inStock })
            }
            return productsFormated
        })
        .then(function (productsFormated) {
            var productsInstock = [], productsNotInStock = [] // Sort products into (InStock) and (NotInStock)
            for (var i = 0; i < productsFormated.length; i++) {
                productsFormated[i].inStock ? productsInstock.push(productsFormated[i]) : productsNotInStock.push(productsFormated[i])
            }
            return productsInstock
        })
    return productsInstock;
}


var getProductsAdvanced = function* (products) { // Foreach product in stock --> Scrape product page for title and model
    for (var i = 0; i < products.length; i++) {
        var product = products[i]
        //var updatedProduct = 
        yield nightmare.goto(product.link)
            .wait('body')
            .evaluate(function () {
                var result = {};
                var itemNames = document.querySelectorAll('[itemprop=name]');
                result.productName = itemNames[0].innerHTML;
                var itemModels = document.querySelectorAll('[itemprop=model]');
                result.productModel = itemModels[0].innerHTML;
                return result
            })
            .then(function (result) {
                Object.assign(products[i], result);
            })
    }
    return products;
}

var buyProduct = function* (product) {
    //var purchaseProduct = 
    yield nightmare.goto(product.link)
        .wait('body')
        .wait('fieldset#add-remove-buttons > input.button:nth-child(1)')
        .click('fieldset#add-remove-buttons > input.button:nth-child(1)')
        .wait(1000) // This needs to be replaced with something more reliable
        // However anything too low and they send us back home
        .wait('div#cart')
        .click('div#cart > a.button.checkout:nth-child(3)')
        // Now we're at the purchase page, but I should add some checks just incase of something crazy!
        .wait('input#order_billing_name')
        .click('input#order_billing_name')
        .insert('input#order_billing_name', 'Huong J. Vancamp')
        .insert('input#order_email', 'HuongJVancamp@jourrapide.com')
        .insert('input#order_tel', '077 0168 0846')
        .insert('input#bo', '18 Harrogate Road')           // Address line 1
        // .insert('input#oba2', 'moo')                    // Address line 2
        // .insert('input#order_billing_address_3', 'moo') // Address line 3
        .insert('input#order_billing_city', 'RUTHERGLEN')
        .insert('input#order_billing_zip', 'G73 9HZ')
        // .click('select#order_billing_country')
        .select('#credit_card_type', 'master') // Change payment gateway
        .insert('input#cnb', '5302 1850 4514 9815')
        .select('#credit_card_month', "05")
        .select('#credit_card_year', "2020")
        .insert('input#vval', '555') // CCV
        .evaluate(function () { // Click the TOS checkbox & then bypass captcha! 
            document.querySelectorAll('.has-checkbox')[0].click()
            checkoutAfterCaptcha(); // eslint-disable-line 
            // The callback that bypasses captcha :kek:
            return
        })

}

/////////////////////////////////// Call functions here!
console.log("Starting scrape!")
vo(getProductsBasic)(function (err, productsInstock) {
    // console.log(productsInstock);
    console.log('Done basic scrape\n');
    vo(getProductsAdvanced)(productsInstock, function (err, productsInstock) {
        console.log(productsInstock);
        console.log('Scraped instock item details!\n');

        var readlineSync = require('readline-sync');
        var userInput = readlineSync.question("Choose a product's index to buy\n");
        var productToBuy;
        for (var i = 0; i < productsInstock.length; i++) {
            if (userInput == productsInstock[i].index) {
                productToBuy = productsInstock[i]
            }
        }
        if (productToBuy == undefined) {
            console.error("Error: Index wasn't valid!")
            process.exit()
        }
        vo(buyProduct)(productToBuy, function (err) {
            if (err) {
                console.log(err)
            }
        });
    });
});

// TODO : Download more info from url of product
//      : Add to basket ✔
//      : Autofill purchase Options ✔
//      : Bypass Captcha ✔
//      : Make a nice UI & Improve user input
//      : Spam scrape when coming up to 11am on thursdays