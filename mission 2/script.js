function showLoader() { $('#loader').show(); }
function hideLoader() { $('#loader').hide(); }
function showError(msg) { $('#errorBox').removeClass('d-none').text(msg); }
function clearError() { $('#errorBox').addClass('d-none').text(''); }
function showResults() { $('#results').removeClass('d-none'); }
function hideResults() { $('#results').addClass('d-none'); }

function renderSummary(total, sum, avg) {
  $('#statTotal').text(total.toLocaleString());
  $('#statPopulationSum').text(sum.toLocaleString());
  $('#statPopulationAvg').text(avg.toLocaleString());
}

function renderCountriesTable(arr) {
  const tbody = $('#tblCountries tbody').empty();
  const sorted = [...arr].sort((a, b) => (b.population || 0) - (a.population || 0));
  sorted.forEach((c, i) => {
    const name = c?.name?.common || 'Unknown';
    const pop = c?.population || 0;
    $('<tr>').append(
      $('<td>').text(i + 1),
      $('<td>').text(name),
      $('<td>').text(pop.toLocaleString())
    ).appendTo(tbody);
  });
}

function renderRegionsTable(arr) {
  const counts = {};
  arr.forEach(c => {
    const region = c?.region || 'Unknown';
    counts[region] = (counts[region] || 0) + 1;
  });
  const entries = Object.entries(counts);
  const tbody = $('#tblRegions tbody').empty();
  entries.forEach(([region, count], i) => {
    $('<tr>').append(
      $('<td>').text(i + 1),
      $('<td>').text(region),
      $('<td>').text(count)
    ).appendTo(tbody);
  });
}

function renderCurrenciesTable(arr) {
  const counts = {};
  arr.forEach(c => {
    if (c?.currencies) {
      Object.keys(c.currencies).forEach(code => {
        counts[code] = (counts[code] || 0) + 1;
      });
    }
  });
  const entries = Object.entries(counts);
  const tbody = $('#tblCurrencies tbody').empty();
  entries.forEach(([code, count], i) => {
    $('<tr>').append(
      $('<td>').text(i + 1),
      $('<td>').text(code),
      $('<td>').text(count)
    ).appendTo(tbody);
  });
}


function fetchCountries(url) {
  clearError();
  hideResults();
  showLoader();

  const sep = url.includes('?') ? '&' : '?';
  const fields = 'fields=name,population,region,currencies';
  const finalUrl = url + sep + fields;

  $.getJSON(finalUrl)
    .done(function (data) {
      hideLoader();
      if (!Array.isArray(data) || data.length === 0) {
        showError('No countries found.');
        return;
      }
      const total = data.length;
      const sum = data.reduce((acc, c) => acc + (c.population || 0), 0);
      const avg = Math.round(sum / total);

      renderSummary(total, sum, avg);
      renderCountriesTable(data);
      renderRegionsTable(data);
      renderCurrenciesTable(data);
      showResults();
    })
    .fail(function (xhr) {
      hideLoader();
      const msg = xhr.status === 404 ? 'No countries found.' : `Error fetching data (${xhr.status}).`;
      showError(msg);
      console.error('API error:', xhr.status, xhr.responseText);
    });
}

$(function () {
  
  $('#btnAll').on('click', function () {
    fetchCountries('https://restcountries.com/v3.1/all');
  });

  $('#btnSearch').on('click', function () {
    const name = $('#inputName').val().trim();
    if (!name) {
      showError('Please enter a country name to search.');
      return;
    }
    fetchCountries('https://restcountries.com/v3.1/name/' + encodeURIComponent(name));
  });

  $('#inputName').on('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#btnSearch').trigger('click');
    }
  });
});
