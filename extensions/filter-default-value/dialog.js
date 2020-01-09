'use strict';
 
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      buildDialog();

      $('#save').click(saveButton);
    });
  });
 
  function buildDialog() {
    fetchFilters();
  }

  function fetchFilters () {
    // While performing async task, show loading message to user.
    $('#loading').addClass('show');

    let filterFetchPromises = [];

    // List of all filters in a dashboard.
    let dashboardfilters = [];

    // To get filter info, first get the dashboard.
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Then loop through each worksheet and get its filters, save promise for later.
    dashboard.worksheets.forEach(function (worksheet) {
      filterFetchPromises.push(worksheet.getFiltersAsync());
    });

    // Now, we call every filter fetch promise, and wait for all the results
    // to finish before displaying the results to the user.
    Promise.all(filterFetchPromises).then(function (fetchResults) {
      fetchResults.forEach(function (filtersForWorksheet) {
        filtersForWorksheet.forEach(function (filter) {
          dashboardfilters.push(filter);
        });
      });

      buildFiltersTable(dashboardfilters);
    });
  }

  // Constructs UI that displays all the dataSources in this dashboard
  // given a mapping from dataSourceId to dataSource objects.
  function buildFiltersTable (filters) {
    // Clear the table first.
    $('#filtersTable > tbody tr').remove();
    const filtersTable = $('#filtersTable > tbody')[0];

    filters.forEach(function (filter, i) {
      let newRow = filtersTable.insertRow(filtersTable.rows.length);
      let nameCell = newRow.insertCell(0);
      let worksheetCell = newRow.insertCell(1);
      let typeCell = newRow.insertCell(2);
      let valuesCell = newRow.insertCell(3);

      let valueArr = getFilterValues(filter);
      let valueStr = '';

      nameCell.innerHTML = filter.fieldName;
      worksheetCell.innerHTML = filter.worksheetName;
      typeCell.innerHTML = filter.filterType;

      let data = {
             name : filter.fieldName,
             worksheet : filter.worksheetName,
             type : filter.filterType
      };


      valueStr = '<input type="hidden" id="filter' + i + '" value="' + encodeURIComponent(JSON.stringify(data)) + '">';
      switch (filter.filterType) {
        case 'categorical':
          valueStr = valueStr
                   + "Value: " + '<input id="filter' + i + '_value0" value="">';
          break;
        case 'range':
          valueStr = valueStr
                   + "Min: " + '<input id="filter' + i + '_value0" value=""><br>'
                   + "Max: " + '<input id="filter' + i + '_value1" value="">';
          break;
        case 'relative-date':
          valueStr = valueStr
                   + "Period: " + '<input id="filter' + i + '_value0" value=""><br>'
                   + "RangeN: " + '<input id="filter' + i + '_value1" value=""><br>'
                   + "Range Type: " + '<input id="filter' + i + '_value2" value="">'
          break;
        default:
      }

      valuesCell.innerHTML = valueStr;
    });
alert ("v1");
    updateUIState(Object.keys(filters).length > 0);
  }

  // This returns a string representation of the values a filter is set to.
  // Depending on the type of filter, this string will take a different form.
  function getFilterValues (filter) {
    let filterValues = [];

    switch (filter.filterType) {
      case 'categorical':
        filter.appliedValues.forEach(function (value) {
          filterValues.push(value.formattedValue);
        });
        break;
      case 'range':
        // A range filter can have a min and/or a max.
        if (filter.minValue) {
          filterValues.push(filter.minValue.formattedValue);
        }
        else {
          filterValues.push(null);
	}

        if (filter.maxValue) {
          filterValues.push(filter.maxValue.formattedValue);
        }
        break;
      case 'relative-date':
        filterValues.push(filter.periodType);
        filterValues.push(filter.rangeN);
        filterValues.push(filter.rangeType);
        break;
      default:
    }

    return filterValues;
  }

  function updateUIState (filtersExist) {
    $('#loading').addClass('hidden');
    if (filtersExist) {
      $('#filtersTable').removeClass('hidden').addClass('show');
      $('#noFiltersWarning').removeClass('show').addClass('hidden');
    } else {
      $('#noFiltersWarning').removeClass('hidden').addClass('show');
      $('#filtersTable').removeClass('show').addClass('hidden');
    }
  }




 
  function columnsUpdate() {
    var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    var worksheetName = $("#selectWorksheet").val();
 
    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });      
 
    worksheet.getSummaryDataAsync({ maxRows: 1 }).then(function (sumdata) {
      var worksheetColumns = sumdata.columns;
      $("#selectCategory").text("");
      $("#selectValue").text("");
      var counter = 1;
      worksheetColumns.forEach(function (current_value) {
        $("#selectCategory").append("<option value='" + counter + "'>"+current_value.fieldName+"</option>");
        $("#selectValue").append("<option value='" + counter + "'>"+current_value.fieldName+"</option>");
        counter++;
      });
      $("#selectCategory").val(tableau.extensions.settings.get("categoryColumnNumber"));
      $("#selectValue").val(tableau.extensions.settings.get("valueColumnNumber"));
    });
  }
 
  function reloadSettings() {
       
  }

  function closeDialog() {
    tableau.extensions.ui.closeDialog("10");
  }
 
  function saveButton() {
    tableau.extensions.settings.set("worksheet", $("#selectWorksheet").val());
    tableau.extensions.settings.set("categoryColumnNumber", $("#selectCategory").val());
    tableau.extensions.settings.set("valueColumnNumber", $("#selectValue").val());
 
    tableau.extensions.settings.saveAsync().then((currentSettings) => {
      tableau.extensions.ui.closeDialog("10");
    });
  }
})();
