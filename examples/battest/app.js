window.addEventListener("load", function() {
  console.log("Hello World!");
  document.getElementById('fireNetworkBtn').addEventListener('click', fireNetwork);
});

function fireNetwork(){
  window.dispatchEvent(new Event('network-ready'));
}
