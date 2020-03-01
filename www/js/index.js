/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

// This function returns the date and time to locale as string
function getCurrentDateTimeFormatted() {
    let date = new Date();
    return date.toLocaleString();
}

// This function gets news from newsapi.org and filter news by sports, business and financial as well as by country
function getNewsFromApi() {
    var sports = new Request('http://newsapi.org/v2/top-headlines?category=sports&apiKey=0fc6d4d1a4e34e4d935d0ef573276d20');
    var business = new Request('http://newsapi.org/v2/top-headlines?category=business&apiKey=0fc6d4d1a4e34e4d935d0ef573276d20');
    var financial = new Request('http://newsapi.org/v2/top-headlines?q=financial&apiKey=0fc6d4d1a4e34e4d935d0ef573276d20');

    return Promise.all([
        fetch(sports),
        fetch(business),
        fetch(financial)
    ]);
}

// This function returns the template NEW to render dynamically in new's page
function newTemplate({ img, title, author, newUrl, isFavorite }) {
    return `<div class="container shadow-lg w-100 my-4" >
                <div class="row">
                    <div class="col-sm-12 p-0">
                        <img class="img-fluid rounded shadow w-100" src="${img}">
                    </div>
                </div>
                <div class="row mt-2"> 
                    <div class="col-md-8">
                        <p class="font-weight-light"> ${title}</p>
                    </div>
                    <div class="col-md-4">
                        <p class="font-weight-bold">${!author || author == null ? "" : author}</p>
                    </div>
                </div>

                <div class="row" >
                    <div class="col-md-12 col-sm-12 text-center mb-2">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="${newUrl}" onchange="addToMyFavorites(this)" ${isFavorite ? "checked" : "" }>
                            <label class="form-check-label font-weight-light" for="${newUrl}">Favorite</label>
                        </div>
                    </div>
                </div>
                <div data-new-id="${newUrl}" data-new-img="${img}" data-new-author="${!author ? "" : author}" data-new-message='${title}'></div>
            </div>`;
}

// This function renders all news article in new-container div element using newTemplate function
// to generate template html to be insert in div news-container
function renderAllNews(articles, fromFavorites) {
    
    const newsContainer = document.getElementById("news-container");

    newsContainer.innerHTML = articles.map((article, index) => {
        
        let isFavorite;

        if (fromFavorites) {
            
            isFavorite = true;
        } else {

            isFavorite = existsInMyFavorites(article.url);
        }
        

        return newTemplate({
            img: article.urlToImage,
            author: article.author,
            newUrl: article.url,
            title: article.title,
            isFavorite,
        });
    }).join(' ');
}

// This function adds a new element in favorites localStorage
function addToMyFavorites(el) {

    
    if (existsInMyFavorites(el.id)) {
        removeFromMyFavorites(el.id);
        return;
    }

    const nodeList = document.querySelectorAll(`[data-new-id]`);

    let elementFound = null;

    nodeList.forEach(item => {

        if (item.getAttribute("data-new-id") === el.id) {
            elementFound = item;
        }
    });

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.push({
        url: elementFound.getAttribute("data-new-id"),
        title: elementFound.getAttribute("data-new-message"),
        author: elementFound.getAttribute("data-new-author"),
        newUrl: elementFound.getAttribute("data-new-id"),
        isFavorite: true,
        urlToImage: elementFound.getAttribute("data-new-img")
    });

    addToLocalStorageFavorites(favorites);
}

// This function says if exists in favorites or not
function existsInMyFavorites(url) {

    let favorites = localStorage.getItem("favorites");

    if (!favorites) {
        return false;
    }

    favorites = JSON.parse(favorites);
    return favorites.find(favorite => favorite.url === url);
}

// This function removes from favorites
function removeFromMyFavorites(url) {

    if (!existsInMyFavorites(url)) {
        return;
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const newFavorites = favorites.filter(favorite => favorite.url != url);
    
    addToLocalStorageFavorites(newFavorites);
}

// This function removes and adds favorites to localStorage
function addToLocalStorageFavorites(favorites) {
    localStorage.removeItem("favorites");
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// This function gets all from favorites
function getAllFromFavorites() {
    return JSON.parse(localStorage.getItem("favorites"));
}