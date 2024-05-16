// bootstrap client side form validations
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()



// ------------- mapbox------------------

try{                                                    // why using try-catch? cause for the pages in which map is not used, this client-side js-code is still 
  mapboxgl.accessToken = mapApiToken;                     // connected to those pages. so using variables like mapApiToken, locationCoordinates, etc. will give error,
                                                        // which will show up in the client's console, when the client opens up those pages. To prevent this, we're using try-catch.
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: locationCoordinates,  // starting position [lng, lat]
    zoom: 9 // starting zoom
});


// marker
const marker1 = new mapboxgl.Marker({ color: "red"})
  .setLngLat(locationCoordinates)
  .addTo(map)
  .setPopup( new mapboxgl.Popup({offset:25}).setHTML(`<h5>${title}</h5><p>Exact Location will be provided after Booking</p>`) );

} catch{
}



  


