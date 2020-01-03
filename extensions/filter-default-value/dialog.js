'use strict';
 
(function () {
  let unregisterHandlerFunctions = [];

  $(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      buildDialog();
    });
  });
 
  function buildDialog() {
    fetchFilters();
  }

  function fetchFilters () {
    // While performing async task, show loading message to user.
    $('#loading').addClass('show');

    // Whenever we restore the filters table, remove all save handling functions,
    // since we add them back later in this function.
    unregisterHandlerFunctions.forEach(function (unregisterHandlerFunction) {
      unregisterHandlerFunction();
    });

    // Since filter info is attached to the worksheet, we will perform
    // one async call per worksheet to get every filter used in this
    // dashboard.  This demonstrates the use of Promise.all to combine
    // promises together and wait for each of them to resolve.
    let filterFetchPromises = [];

    // List of all filters in a dashboard.
    let dashboardfilters = [];

    // To get filter info, first get the dashboard.
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Then loop through each worksheet and get its filters, save promise for later.
    dashboard.worksheets.forEach(function (worksheet) {
      filterFetchPromises.push(worksheet.getFiltersAsync());

      // Add filter event to each worksheet.  AddEventListener returns a function that will
      // remove the event listener when called.
      let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
      unregisterHandlerFunctions.push(unregisterHandlerFunction);
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

    filters.forEach(function (filter) {
      let newRow = filtersTable.insertRow(filtersTable.rows.length);
      let nameCell = newRow.insertCell(0);
      let worksheetCell = newRow.insertCell(1);
      let typeCell = newRow.insertCell(2);
      let valuesCell = newRow.insertCell(3);

      const valueStr = getFilterValues(filter);

      nameCell.innerHTML = filter.fieldName;
      worksheetCell.innerHTML = filter.worksheetName;
      typeCell.innerHTML = filter.filterType;
      valuesCell.innerHTML = valueStr;
    });
  }

  // This returns a string representation of the values a filter is set to.
  // Depending on the type of filter, this string will take a different form.
  function getFilterValues (filter) {
    let filterValues = '';

    switch (filter.filterType) {
      case 'categorical':
        filter.appliedValues.forEach(function (value) {
          filterValues += value.formattedValue + ', ';
        });
        break;
      case 'range':
        // A range filter can have a min and/or a max.
        if (filter.minValue) {
          filterValues += 'min: ' + filter.minValue.formattedValue + ', ';
        }

        if (filter.maxValue) {
          filterValues += 'min: ' + filter.maxValue.formattedValue + ', ';
        }
        break;
      case 'relative-date':
        filterValues += 'Period: ' + filter.periodType + ', ';
        filterValues += 'RangeN: ' + filter.rangeN + ', ';
        filterValues += 'Range Type: ' + filter.rangeType + ', ';
        break;
      default:
    }

    // Cut off the trailing ", "
    return filterValues.slice(0, -2);
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
