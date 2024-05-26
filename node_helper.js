const NodeHelper = require("node_helper");
const axios = require("axios");
const { JSDOM } = require("jsdom");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-Tommekalender helper started...");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_TOMME_DAGER") {
            this.getTommeDager(payload);
        }
    },

    async getTommeDager(adresse) {
        try {
            const response = await axios.get(`https://www.hiks.no/privat/tommekalender/?adresse=${encodeURIComponent(adresse)}`);
            const dom = new JSDOM(response.data);
            const document = dom.window.document;

            let tommeDager = [];
            const typer = ["Matavfall", "Restavfall", "Glass/Metallemballasje", "Plast", "Papir"];

            const cards = document.querySelectorAll(".card");
            cards.forEach(card => {
                const fractionName = card.querySelector(".fraction-name span").textContent.trim();
                if (typer.includes(fractionName)) {
                    const dates = card.querySelectorAll(".day-date");
                    dates.forEach(dateElement => {
                        let dato = dateElement.textContent.trim();
                        tommeDager.push({ type: fractionName, dato });
                    });
                }
            });

            this.sendSocketNotification("TOMME_DAGER_RESULT", tommeDager);
        } catch (error) {
            console.error("Error fetching tømmekalender data:", error);
        }
    }
});
