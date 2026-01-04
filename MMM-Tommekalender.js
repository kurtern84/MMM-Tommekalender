/* global Module */

Module.register("MMM-Tommekalender", {
  defaults: {
    adresse: "",
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

  start: function () {
    this.tommeDager = null;
    this.getData();
    this.scheduleUpdate();
  },

  getStyles: function () {
    return ["MMM-Tommekalender.css"];
  },

  getData: function () {
    this.sendSocketNotification("GET_TOMME_DAGER", this.config.adresse);
  },

  scheduleUpdate: function () {
    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "TOMME_DAGER_RESULT") {
      this.tommeDager = payload;
      this.updateDom();
    }
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.className = "MMM-Tommekalender";

    if (!this.tommeDager) {
      wrapper.innerHTML = "Laster tømmekalender...";
      return wrapper;
    }

    var table = document.createElement("table");
    table.className = "tk-table";

    // Header
    var thead = document.createElement("thead");
    var headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th class="tk-col-type">Type avfall</th>
      <th class="tk-col-date">Dato</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    var tbody = document.createElement("tbody");

    const uniqueTypes = [...new Set(this.tommeDager.map(d => d.type))];

    uniqueTypes.forEach(type => {
      let dates = this.tommeDager
        .filter(d => d.type === type)
        .map(d => d.dato);

      if (this.config.showNextOnly && dates.length > 0) {
        dates = [dates[0]];
      }

      dates.forEach(dato => {
        var row = document.createElement("tr");

        const iconClass = this.config.icons[type] || "fas fa-calendar";

        row.innerHTML = `
          <td class="tk-col-type">
            <div class="tk-type-wrap">
              <i class="tk-icon ${iconClass}"></i>
              <span class="tk-type-text">${type}</span>
            </div>
          </td>
          <td class="tk-col-date">
            <span class="tk-date">${dato}</span>
          </td>
        `;

        tbody.appendChild(row);
      });
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }
});
