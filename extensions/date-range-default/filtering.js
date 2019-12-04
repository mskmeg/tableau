'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
      $('#console').html("Hello World 3");

      InitFilters ();
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });


  // This function removes all filters from a dashboard.
  function InitFilters () {
    // While performing async task, show loading message to user.
    $('#loading').removeClass('hidden').addClass('show');
    $('#filtersTable').removeClass('show').addClass('hidden');

    const dashboard = tableau.extensions.dashboardContent.dashboard;

    dashboard.worksheets.forEach(function (worksheet) {
      worksheet.getFiltersAsync().then(function (filtersForWorksheet) {
        let filterClearPromises = [];

        filtersForWorksheet.forEach(function (filter) {
          if (filter.fieldName == "Invoice date") {
            let today = new Date();
            let minDate = new Date();
            let maxDate = new Date();

            minDate.setDate(today.getDate() - 1);
            maxDate.setDate(today.getDate() - 1);

            filterClearPromises.push(worksheet.applyRangeFilterAsync(filter.fieldName, { min: minDate, max: maxDate}));
	  }
        });

        // Same pattern as in fetchFilters, wait until all promises have finished
        // before updating the UI state.
        Promise.all(filterClearPromises).then(function () {
          updateUIState(false);
        });
      });
    });
  }



  function configure() { 
    const popupUrl = `${window.location.origin}/dialog.html`;
    let defaultPayload = "";

    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height: 500, width: 500 }).then((closePayload) => {
      // The promise is resolved when the dialog has been expectedly closed, meaning that
      // the popup extension has called tableau.extensions.ui.closeDialog.
      // ...

      // The close payload is returned from the popup extension via the closeDialog() method.
     // ....

    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
          break;
        default:
          console.error(error.message);
      }
    });
  } 
})();
