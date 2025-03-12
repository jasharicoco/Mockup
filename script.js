




document.addEventListener("DOMContentLoaded", () => {
    loadLinks(); 
    document.getElementById("show-form-btn").addEventListener("click", showForm);
});

function showForm() {
    document.getElementById("link-form").style.display = "block";
    document.getElementById("show-form-btn").style.display = "none";
}

function hideForm() {
    document.getElementById("link-form").style.display = "none";
    document.getElementById("show-form-btn").style.display = "block";
}

function addLink() {
    const linkName = document.getElementById("link-name").value.trim();
    const linkURL = document.getElementById("link-url").value.trim();
    const linksList = document.getElementById("links-list");

    if (!linkName || !linkURL) {
        alert("Fyll i både namn och URL!");
        return;
    }

    // Skapa nytt listobjekt
    const newLink = document.createElement("li");
    newLink.innerHTML = `<a href="${linkURL}" target="_blank">${linkName}</a> 
                         <button onclick="removeLink(this)">❌</button>`;

    linksList.appendChild(newLink);

    // Spara i LocalStorage
    saveLink(linkName, linkURL);

    // Rensa fält och göm formuläret
    document.getElementById("link-name").value = "";
    document.getElementById("link-url").value = "";
    hideForm();
}

function removeLink(button) {
    const listItem = button.parentElement;
    const linkName = listItem.querySelector("a").innerText;

    // Ta bort från LocalStorage
    removeLinkFromStorage(linkName);

    // Ta bort från listan
    listItem.remove();
}

function saveLink(name, url) {
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
    links.push({ name, url });
    localStorage.setItem("savedLinks", JSON.stringify(links));
}

function removeLinkFromStorage(name) {
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
    links = links.filter(link => link.name !== name);
    localStorage.setItem("savedLinks", JSON.stringify(links));
}

function loadLinks() {
    const linksList = document.getElementById("links-list");
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];

    links.forEach(link => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a> 
                              <button onclick="removeLink(this)">❌</button>`;
        linksList.appendChild(listItem);
    });
}


//Dashboard Title

document.addEventListener("DOMContentLoaded", () => {
    const titleElement = document.getElementById("editable-title");

    // Ladda sparad rubrik om den finns
    const savedTitle = localStorage.getItem("dashboardTitle");
    if (savedTitle) {
        titleElement.textContent = savedTitle;
    }

    // Gör rubriken redigerbar vid klick
    titleElement.addEventListener("click", () => {
        const currentText = titleElement.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.style.fontSize = "2rem"; // Anpassa storlek

        // Byt ut rubriken mot input-fältet
        titleElement.replaceWith(input);
        input.focus();

        // Spara ändring när användaren trycker Enter eller klickar utanför
        const saveTitle = () => {
            const newText = input.value.trim() || "Min Dashboard"; // Standardvärde om tomt
            localStorage.setItem("dashboardTitle", newText);
            titleElement.textContent = newText;
            input.replaceWith(titleElement);
        };

        input.addEventListener("blur", saveTitle); // Spara vid klick utanför
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                saveTitle();
            }
        });
    });
});

// Klocka

function updateDateTime() {
    const now = new Date();

    // Formatera datum (ex: Måndag, 6 mars 2025)
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    const formattedDate = now.toLocaleDateString('sv-SE', options);

    // Formatera klockan (ex: 14:30:45)
    const formattedTime = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    // Uppdatera elementen i HTML
    document.querySelector(".date").textContent = formattedDate;
    document.querySelector(".clock").textContent = formattedTime;
}

// Uppdatera tiden varje sekund
setInterval(updateDateTime, 1000);

// Kör funktionen direkt vid start
updateDateTime();



// Bakgrundsbild

// Funktion för att byta bakgrundsbild från Unsplash API med Fetch API
async function changeBackground() {
    const apiKey = 'E_1NnPtK1MqmSsNsI_z8Eb_5Gcpbu418ocfgWV1yvsw';
    const apiUrl = `https://api.unsplash.com/collections/1913171/photos?client_id=${apiKey}`; // Standard
    //const apiUrl = `https://api.unsplash.com/collections/8860674/photos?client_id=${apiKey}`; // Thailand

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP-fel! Status: ${response.status}`);

        const data = await response.json();
        
        // ✅ Välj en slumpmässig bild från samlingen
        const randomImage = data[Math.floor(Math.random() * data.length)];

        if (!randomImage || !randomImage.urls) {
            throw new Error("Ingen giltig bild hittades.");
        }

        const newBackgroundUrl = randomImage.urls.regular;
        document.body.style.backgroundImage = `url(${newBackgroundUrl})`;

        // Spara bakgrund i localStorage
        localStorage.setItem('background', `url(${newBackgroundUrl})`);

    } catch (error) {
        console.error('Fel vid hämtning av bakgrundsbild:', error);
    }
}
changeBackground();

// Funktion för att ladda väderdata
async function loadWeather(latOrCity, lon = null) {
    const todayDiv = document.getElementById("today");
    const tomorrowDiv = document.getElementById("tomorrow");
    const thirdDayDiv = document.getElementById("third-day");

    // Lägg till lang=sv för att få väderbeskrivning på svenska
    let url = lon
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${latOrCity}&lon=${lon}&units=metric&appid=bd5e378503939ddaee76f12ad7a97608&lang=sv`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${latOrCity}&units=metric&appid=bd5e378503939ddaee76f12ad7a97608&lang=sv`;

    try {
        let response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                alert("Staden hittades inte. Kontrollera stavningen och försök igen.");
                return;
            } else {
                alert("Ett oväntat fel inträffade. Försök igen senare.");
                return;
            }
        }

        let data = await response.json();

        // Hämta väderprognosen för de specifika dagarna
        let today = data.list[0]; // Dagens väder
        let tomorrow = data.list[8]; // Imorgon (första prognos på nästa dag)
        let thirdDay = data.list[16]; // Tredje dagen (det är 8 intervaller mellan varje dag i API:t)

        // Funktion för att få huvudväderbeskrivning (t.ex. Rain, Clear, Clouds)
        function getMainDescription(main) {
            return main.charAt(0).toUpperCase() + main.slice(1); // Första bokstaven versal
        }

        // Uppdatera "Idag"
        todayDiv.querySelector("h3").innerText = "Idag";
        todayDiv.querySelector("#today-temp").innerHTML = `<b>${today.main.temp}°C</b>`;
        todayDiv.querySelector("#today-weather").innerText = getMainDescription(today.weather[0].main); // Kort väderbeskrivning
        todayDiv.querySelector("#today-icon").src = `https://openweathermap.org/img/wn/${today.weather[0].icon}.png`;

        // Uppdatera "Imorgon"
        tomorrowDiv.querySelector("h3").innerText = "Imorgon";
        tomorrowDiv.querySelector("#tomorrow-temp").innerHTML = `<b>${tomorrow.main.temp}°C</b>`;
        tomorrowDiv.querySelector("#tomorrow-weather").innerText = getMainDescription(tomorrow.weather[0].main); // Kort väderbeskrivning
        tomorrowDiv.querySelector("#tomorrow-icon").src = `https://openweathermap.org/img/wn/${tomorrow.weather[0].icon}.png`;

        // Uppdatera "Veckodag"
        let thirdDayDate = new Date(thirdDay.dt * 1000);
        let daysOfWeek = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
        let thirdDayName = daysOfWeek[thirdDayDate.getDay()];

        thirdDayDiv.querySelector("h3").innerText = thirdDayName;
        thirdDayDiv.querySelector("#third-day-temp").innerHTML = `<b>${thirdDay.main.temp}°C</b>`;
        thirdDayDiv.querySelector("#third-day-weather").innerText = getMainDescription(thirdDay.weather[0].main); // Kort väderbeskrivning
        thirdDayDiv.querySelector("#third-day-icon").src = `https://openweathermap.org/img/wn/${thirdDay.weather[0].icon}.png`;

    } catch (error) {
        console.error("Kunde inte hämta vädret", error);
        //alert("Kunde inte hämta väderinformation. Försök igen senare.");
    }
}

// Exempel: Anropa funktionen med en stad
loadWeather("Stockholm");


// RADIO

document.addEventListener("DOMContentLoaded", function() {
    loadChannels();
});

async function loadChannels() {
    const channelsBody = document.querySelector("#radio-list");
    channelsBody.innerHTML = ''; // Rensa tidigare kanalflöde innan ny data läggs till

    let url = 'https://api.sr.se/api/v2/channels';

    try {
        // Hämta kanaldata
        const response = await fetch(url);
        const xmlData = await response.text(); // Hämta svaret som text (XML)

        // Skapa en parser för att omvandla XML-texten till ett DOM-träd
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
        
        // Hämta alla kanaler från XML-svaret
        const channels = xmlDoc.getElementsByTagName('channel');

        // Lista med tillåtna kanaler (P1, P2, P3)
        const allowedChannels = ['P1', 'P2', 'P3'];

        // Logga varje kanal för att se vad som finns
        Array.from(channels).forEach(async channel => {
            // Hämta data från varje kanal
            const channelName = channel.getAttribute('name');
            const channelTagline = channel.getElementsByTagName('tagline')[0]?.textContent || 'Ingen slogan';
            const channelUrl = channel.getElementsByTagName('siteurl')[0]?.textContent || '#';
            const channelImageUrl = channel.getElementsByTagName('image')[0]?.textContent || '';
            const liveAudioUrl = channel.getElementsByTagName('liveaudio')[0]?.getElementsByTagName('url')[0]?.textContent || '#';
            const scheduleUrl = channel.getElementsByTagName('scheduleurl')[0]?.textContent || '';

            // Filtrera kanaler så att endast P1, P2 och P3 visas
            if (allowedChannels.includes(channelName)) {
                // Hämta information om nuvarande program
                let currentProgram = 'Inget program nu';
                if (scheduleUrl) {
                    try {
                        const programResponse = await fetch(scheduleUrl);
                        
                        // Kontrollera om svaret är korrekt (XML)
                        if (!programResponse.ok) {
                            console.error("Fel vid hämtning av programdata, status:", programResponse.status);
                            return;
                        }
            
                        const xmlData = await programResponse.text();
                        
                        // Skapa en parser för att omvandla XML-texten till ett DOM-träd
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
                        
                        // Hämta aktuellt program från XML (t.ex. genom att ta första programmet)
                        const currentProgramData = xmlDoc.getElementsByTagName('program')[0];
                        
                        if (currentProgramData) {
                            // Hämta programnamnet från name-attributet
                            const programName = currentProgramData.getAttribute('name');
                            if (programName) {
                                currentProgram = programName || 'Inget program nu';
                            } else {
                                console.log("Inget 'name'-attribut i currentProgramData");
                            }
                        } else {
                            console.log("Inget programdata hittades.");
                        }
                    } catch (error) {
                        console.error("Kunde inte hämta programdata", error);
                    }
                }
            
                // Skapa en ny rad för varje kanal
                let row = document.createElement("li"); // Ändra från tr till li
                
                // Lägg till kanaldata i listan
                row.innerHTML = `
                    <div class="channel-row">
                        <div class="channel-info-wrapper">
                            <img src="${channelImageUrl}" alt="${channelName}" class="channel-img">
                            <div class="channel-info">
                                <b><a href="${liveAudioUrl}" target="_blank">${channelName}</a></b><br>
                                <span>${currentProgram}</span>
                            </div>
                        </div>
                        <div class="audio-wrapper">
                            <audio controls>
                                <source src="${liveAudioUrl}" type="audio/mpeg">
                                Din webbläsare stödjer inte ljuduppspelning.
                            </audio>
                        </div>
                    </div>
                `;
                channelsBody.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Kunde inte hämta kanaler", error);
    }
}
