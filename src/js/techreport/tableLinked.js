import { DataUtils } from "./utils/data";

class TableLinked {
  constructor(id, pageConfig, globalConfig, filters, data) {
    this.id = id;
    this.config = globalConfig;
    this.pageConfig = pageConfig;
    this.pageFilters = filters;
    this.submetric = ''; // TODO: Fetch the default one from somewhere
    this.data = data;
    this.dataArray = [];

    this.updateContent();
  }

  // Update content in the table
  updateContent(content) {
    // Select a table based on the passed in id
    const component = document.getElementById(`table-${this.id}`);
    const tbody = component?.querySelector('tbody');
    const timestamp = document.querySelector('[data-slot="timestamp"]');
    const key = component.dataset.key;

    if(key) {
      this.dataArray = this.data[key] ? Object.values(this.data[key]) : [];
    } else {
      this.dataArray = Object.values(this.data);
    }

    this.dataArray = this.dataArray.filter(row => row.length > 0);

    if(tbody) {
      // Reset what's in the table before adding new content
      tbody.innerHTML = '';

      const tableApps = content?.apps || this.pageFilters.app;

      // Collect the settings in an object
      const tableConfig = {
        apps: tableApps,
        config: this.pageConfig?.[this.id]?.table,
        id: this.id,
      };

      const filters = new URLSearchParams(window.location.search);
      const geo = filters.get('geo') || 'ALL';
      const rank = filters.get('rank') || 'ALL';

      // sort data
      const sortEndpoint = component.dataset.sortEndpoint;
      const sortMetric = component.dataset.sortMetric;
      const sortKey = component.dataset.sortKey;
      const client = component.dataset.client;

      if(sortMetric) {
        this.dataArray = this.dataArray.sort((techA, techB) => {
          // Sort techs by date to get the latest
          const aSortedDate = techA.sort((a, b) => new Date(b.date) - new Date(a.date));
          const bSortedDate = techB.sort((a, b) => new Date(b.date) - new Date(a.date));
          const aLatest = aSortedDate[0];
          const bLatest = bSortedDate[0];

          // Get the correct endpoint & metric
          const aMetric = aLatest?.[sortEndpoint]?.find(row => row?.name === sortMetric);
          const bMetric = bLatest?.[sortEndpoint]?.find(row => row?.name === sortMetric);

          const aValue = aMetric?.[client]?.[sortKey];
          const bValue = bMetric?.[client]?.[sortKey];

          return bValue - aValue > 0 ? 1 : -1;
        });
      }

      if(timestamp) {
        timestamp.textContent = this.dataArray[1]?.[0]?.date;
      }

      this.dataArray.forEach(technology => {
        // Set the data and the app name
        const data = technology;
        const app = technology[0]?.technology;
        const formattedApp = DataUtils.formatAppName(app);

        // Select the latest entry for each technology
        const sorted = data?.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sorted?.[0];

        // If the latest entry exist, add it to the table
        if(latest) {
          const tr = document.createElement('tr');

          tableConfig.config?.columns?.forEach(column => {
            let cell;
            if(column.type === 'heading') {
              cell = document.createElement('th');
              cell.classList.add('app-cell');

              const img = document.createElement('span');
              const imgUrl = `https://cdn.httparchive.org/static/icons/${formattedApp}.png`;
              img.setAttribute('aria-hidden', 'true');
              img.setAttribute('style', `background-image: url(${imgUrl})`);
              img.classList.add('app-img');
              cell.append(img);

              const link = document.createElement('a');
              link.setAttribute('href', `/reports/techreport/tech?tech=${app}&geo=${geo}&rank=${rank}`);
              link.innerHTML = formattedApp;
              cell.append(link);
            } else if (column.type === 'checkbox') {
              cell = document.createElement('td');
              const formattedApp = DataUtils.formatAppName(app);
              const checkbox = document.createElement('input');
              checkbox.setAttribute('type', 'checkbox');
              checkbox.setAttribute('data-app', formattedApp);
              checkbox.setAttribute('data-name', `table-${this.id}`);
              checkbox.setAttribute('id', `${app}-table-${this.id}`);
              checkbox.setAttribute('name', `${app}-table-${this.id}`);
              checkbox.addEventListener('change', () => {
                const appLinks = document.querySelectorAll('[data-name="selected-apps"]');
                const selectedApps = document.querySelectorAll(`[data-name="table-${this.id}"]:checked`);

                const selectedAppsFormatted = [];

                selectedApps.forEach(selectedApp => {
                  selectedAppsFormatted.push(selectedApp.dataset.app);
                });

                appLinks.forEach(appLinkEl => {
                  appLinkEl.setAttribute('href', `/reports/techreport/tech?tech=${selectedAppsFormatted.join(',')}`);
                  appLinkEl.innerHTML = `Compare ${selectedApps.length} technologies`;
                });
              });
              cell.append(checkbox);

              const label = document.createElement('label');
              label.innerHTML = `Select ${formattedApp}`;
              label.classList.add('sr-only');
              label.setAttribute('for', `${app}-table-${this.id}`);
              cell.append(label);
              cell.classList.add('check-cell');
            } else if(column.key === 'client') {
              cell = document.createElement('td');
              cell.innerHTML = component.dataset.client;
            } else {
              const cellContent = document.createElement('span');
              cell = document.createElement('td');
              const dataset = latest?.[column?.endpoint];
              let value = dataset?.find(entry => entry.name === column.subcategory);
              value = value?.[component.dataset.client]?.[column?.metric];
              if(column.suffix) {
                cellContent.innerHTML = `${value?.toLocaleString()}${column.suffix}`;
              } else {
                cellContent.innerHTML = `${value?.toLocaleString()}`;
              }

              if(column.viz === 'progress') {
                cell.setAttribute('style', `--cell-value: ${value}%`);
                cell.dataset.value = value;
              } else if(column.viz === 'progress-circle') {
                const score = DataUtils.getLighthouseScoreCategories(value, this.config.lighthouse_brackets);
                cellContent.classList.add('progress-circle', score.name);
                cellContent.setAttribute('style', `--offset: ${value}%`);
              }

              cell.append(cellContent);
            }

            if(column.className) {
              cell.className = column.className;
            }

            tr.append(cell);
          });
          tbody.append(tr);
        }
      });

    }
  }
}

export default TableLinked;
