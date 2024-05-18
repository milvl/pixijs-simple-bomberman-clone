// find elements
var banner = $("#banner-message")
var button = $("#bttn-color-change")

function changeStyle() {
	banner.toggleClass("alt")
}

// handle click and add class
/* button.on("click", () => 
{
  banner.toggleClass("alt")
}) */
button.on("click", changeStyle)

