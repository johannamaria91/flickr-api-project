/*
    1. Skapa en key för Flickrs API och spara i variabel
    2. Skapa sökfält och sökknapp
    3. Fetcha Flickr API med sökterm och key vid klick på sökknapp
    4. Visa bilderna. För varje bild: 
        1. Skapa ett element 
        2. Lägg till bilden i elementet
        3. Lägg till elementet i HTML:en
    5. Inställningar för antal på sida
    6. Bild ska visas större när jag klickar på den: 
        1. eventlyssnare på alla bilder (i getImages-funktionen)
        2. funktion för att öppna upp lightbox
        3. Knapp för att klicka bort den 
    7. Klicka för att komma till nästa sida
        1. Skapa element (knappar) i HTML 
        2. Skapa eventlyssnare på knapparna
        2. Lägg till sidnummer i URL:en
*/

const searchButton = document.getElementById('search-button');
const queryInput = document.getElementById('query');
const key = 'e4f5d3b5780ea4fbdd3e455438bca265';
const imageGallery = document.getElementById('gallery');
const searchResults = document.getElementById('search-term');
const imgPerPage = document.getElementById('img-per-page');
const sortImgs = document.getElementById('sort-imgs');
const resultsArea = document.getElementById('img-results');
const pagesSection = document.getElementById('pages');
let noPerPage = 10;
let query = "";
let pageNo = 1;
let sort = "relevance";
let totalPages;

// Fetcha Flickr API med sökterm, key, antal per sida, sidnummer, sorteringsordning vid klick på sökknapp
let getImageList = async (query, noPerPage, pageNo, sort) => {
    const response = await fetch(`https://api.flickr.com/services/rest?api_key=${key}&method=flickr.photos.search&text=${query}&per_page=${noPerPage}&page=${pageNo}&sort=${sort}&format=json&nojsoncallback=1`);
    const data = await response.json();
    console.log(data);
    getImages(data.photos.photo); 
    searchResults.innerHTML = `Found ${data.photos.total} results for: "${queryInput.value}"`; 
    totalPages = data.photos.pages;
}

//scrollista för att kunna välja antal bilder per sida 
let getScrollList = () => {
    const listLabel = document.createElement('label');
    listLabel.setAttribute('for', "drop-down-list");
    listLabel.innerHTML = 'Images per page: '
    imgPerPage.appendChild(listLabel);
    const dropDownList = document.createElement('select');
    dropDownList.setAttribute('id', "drop-down-list");
    dropDownList.innerHTML = `<option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>`
    imgPerPage.appendChild(dropDownList);
}

//scrollista för att kunna välja sorteringshåll
let getSortOptions = () => {
    const sortListLabel = document.createElement('label');
    sortListLabel.setAttribute('for', "sort-options-list");
    sortListLabel.innerHTML = 'Sort images by: '
    sortImgs.appendChild(sortListLabel);
    const sortDropDownList = document.createElement('select');
    sortDropDownList.setAttribute('id', "sort-options-list");
    sortDropDownList.innerHTML = `<option value="relevance">Relevance</option>
    <option value="date-posted-desc">Newest first</option>
    <option value="date-posted-asc">Oldest First</option>`
    sortImgs.appendChild(sortDropDownList);
}

//visa bilderna      
let getImages = (images) => {
    resultsArea.innerHTML = "";

    images.forEach(image => { 
        let farmID = image.farm;
        let serverID = image.server;
        let imgID = image.id;
        let secret = image.secret;
        let altDesc = image.title;
        let imgURL = `https://farm${farmID}.staticflickr.com/${serverID}/${imgID}_${secret}_q.jpg`;
        const imageGalleryItem = document.createElement('figure'); 
        imageGalleryItem.setAttribute('id', "small-img");
        imageGalleryItem.innerHTML = `<img src="${imgURL}" alt="${altDesc}">` 
        resultsArea.appendChild(imageGalleryItem);

        imageGalleryItem.addEventListener('click', () => { //eventlyssnare för varje bild
            const overlay = document.getElementById('overlay');
            overlay.classList.toggle('hide'); 
            overlay.classList.add('overlay-fade');
            showLargeImage(farmID, serverID, imgID, secret); 
            document.querySelector('figcaption').innerHTML = image.title; 
            imageGalleryItem.innerHTML = `<img src="${imgURL}" alt="${altDesc}">`
            })
})
};

//funktion för att visa större bild
let showLargeImage = (farmID, serverID, imgID, secret) => { 
    const largeImage = document.getElementById('full-image');
    let largeImgURL = `https://farm${farmID}.staticflickr.com/${serverID}/${imgID}_${secret}.jpg` 
    largeImage.innerHTML = `<img src="${largeImgURL}">`
}

//eventlyssnare för sökknappen
searchButton.addEventListener('click', () => { 
    query = queryInput.value;
    getImageList(query, noPerPage, pageNo, sort); 
    pageNo = 1; //börja alltid på sida 1 vid nytt sökord
    imageGallery.classList.remove('white-bg')
    document.getElementById('page-number').innerHTML = `Page ${pageNo}`
    document.getElementById('back').classList.add('hide'); 
    document.getElementById('forward').classList.remove('hide'); 

    //plocka fram inställningssektionerna ifall det är första sökningen
    if (imgPerPage.innerHTML === "") {
        getScrollList(); 
        pagesSection.classList.toggle('hide'); 
        getSortOptions(); 
    };

    //eventlyssnare för val av antal bilder
    document.getElementById("drop-down-list").addEventListener('change', () => { 
        
        let perPage = document.getElementById("drop-down-list");
        pageNo = 1; 
        document.getElementById('page-number').innerHTML = `Page ${pageNo}` 
        noPerPage = perPage.value;
        getImageList(query, noPerPage, pageNo, sort);
        document.getElementById('forward').classList.remove('hide');
        document.getElementById('back').classList.add('hide'); 
    });
    
    //eventlyssnare för val av sortering
    document.getElementById("sort-options-list").addEventListener('change', () => { 
        let sortOption = document.getElementById("sort-options-list");
        pageNo = 1; 
        document.getElementById('page-number').innerHTML = `Page ${pageNo}` 
        sort = sortOption.value;
        getImageList(query, noPerPage, pageNo, sort); 
        document.getElementById('forward').classList.remove('hide');
        document.getElementById('back').classList.add('hide'); 
    });
});

//eventlyssnare på framåtpilen
document.getElementById('forward').addEventListener('click', () => { 
    if (pageNo === 1) { //ta bort Hide från bakåtpilen ifall vi var på sidan 1
        document.getElementById('back').classList.remove('hide');
    }

    if (pageNo < totalPages) { 
        pageNo += 1; 
        document.getElementById('page-number').innerHTML = `Page ${pageNo}` 
        getImageList(query, noPerPage, pageNo, sort); 
    } 
    
    if (pageNo === totalPages) { //om vi är på sista sidan så göms framåtpilen
        document.getElementById('forward').classList.add('hide');
    } 
});

//eventlyssnare på bakåtpilen
document.getElementById('back').addEventListener('click', () => { 
    if (pageNo === totalPages) { //om vi är på sista sidan och klickar på bakåtpilen så tar vi fram framåtpilen
        document.getElementById('forward').classList.remove('hide');
    }

    if (pageNo > 1) { 
        pageNo -= 1; 
        document.getElementById('page-number').innerHTML = `Page ${pageNo}`
        getImageList(query, noPerPage, pageNo, sort);
        if (pageNo === 1) { //om sidnumret blir 1 efter klick så göms bakåtpilen
            document.getElementById('back').classList.add('hide');
        }
    } 
});

// eventlyssnare på kryss för att stänga ner overlayen
document.getElementById('close').addEventListener('click', () => { 
    overlay.classList.toggle('hide'); 
    overlay.classList.remove('overlay-fade');
});



