Module.register("MMM-Tommekalender", {
    defaults: {
        adresse: "Åsvegen 12, Østre Toten",
        updateInterval: 86400000, // Oppdatering hver 24. time
        showNextOnly: true,
        icons: {
            "Matavfall": "fas fa-apple-alt",
            "Restavfall": "fas fa-trash",
            "Glass/Metallemballasje": "fas fa-wine-bottle",
            "Plast": "fas fa-recycle",
            "Papir": "fas fa-newspaper"
        }
    },

    start: function() {
        this.getData();
        this.scheduleUpdate();
    },

    getData: function() {
        this.sendSocketNotification("GET_TOMME_DAGER", this.config.adresse);
    },

    scheduleUpdate: function() {
        var self = this;
        setInterval(function() {
            self.getData();
        }, this.config.updateInterval);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "TOMME_DAGER_RESULT") {
            this.tommeDager = payload;
            this.updateDom();
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");

        if (!this.tommeDager) {
            wrapper.innerHTML = "Laster tømmekalender...";
            return wrapper;
        }

        var table = document.createElement("table");
        var header = document.createElement("tr");
        header.innerHTML = "<th>Type Avfall</th><th>Dato</th>";
        table.appendChild(header);

        const uniqueTypes = [...new Set(this.tommeDager.map(d => d.type))];
        uniqueTypes.forEach(type => {
            let dates = this.tommeDager.filter(d => d.type === type).map(d => d.dato);
            if (this.config.showNextOnly) {
                dates = [dates[0]];
            }

            dates.forEach(dato => {
                var row = document.createElement("tr");
                row.innerHTML = `<td><i class="${this.config.icons[type]}"></i> ${type}</td><td>${dato}</td>`;
                table.appendChild(row);
            });
        });

        wrapper.appendChild(table);
        return wrapper;
    }
});
