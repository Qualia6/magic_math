const gameSettings = {
	domain: document.getElementById("domain-select"),
	addition: document.getElementById("addition-opperation"),
	subtraction: document.getElementById("subtraction-opperation"),
	multiplication: document.getElementById("multiplication-opperation"),
	division: document.getElementById("division-opperation"),
	size: document.getElementById("size-range"),
	blocker: document.getElementById("size-range-blocker"),
	start: document.getElementById("start-button"),
	menu: document.getElementById("menu")
}

// adjusts the lil lock icon on the slider so the user know which size values are unacceptable
function lockSlider() {
	if (countMenuChecked() + 1 > gameSettings.size.value) gameSettings.size.value = countMenuChecked() + 1
	if (countMenuChecked() == 3) gameSettings.blocker.classList = ["pos-1"]
	else if (countMenuChecked() == 4) gameSettings.blocker.classList = ["pos-2"]
	else gameSettings.blocker.classList = []
}

// makes different menu items locked if they are not allowed by a given domain
function potentiallyLockMenuItems() {
	switch (gameSettings.domain.value) {
		case "N":
			gameSettings.addition.checked = true
			gameSettings.addition.disabled = true

			gameSettings.subtraction.checked = false
			gameSettings.subtraction.disabled = true

			gameSettings.multiplication.checked = true
			gameSettings.multiplication.disabled = true

			gameSettings.division.checked = false
			gameSettings.division.disabled = true
			break;
		case "Z":
			gameSettings.addition.disabled = false
			if (!gameSettings.subtraction.checked || !gameSettings.multiplication.checked) gameSettings.addition.checked = true

			gameSettings.subtraction.disabled = false
			if (!gameSettings.multiplication.checked) gameSettings.subtraction.checked = true

			gameSettings.multiplication.disabled = false

			gameSettings.division.checked = false
			gameSettings.division.disabled = true
			break;
		case "R":
		case "Ce":
		case "C":
			gameSettings.addition.disabled = false

			gameSettings.subtraction.disabled = false

			gameSettings.multiplication.disabled = false

			gameSettings.division.disabled = false
			break;
	}
	lockSlider()
}

potentiallyLockMenuItems()

gameSettings.domain.addEventListener("change", potentiallyLockMenuItems)

// counts the number of operators checked
function countMenuChecked() {
	return (
		gameSettings.addition.checked +
		gameSettings.subtraction.checked +
		gameSettings.multiplication.checked +
		gameSettings.division.checked
	)
}

// these four toggles the opperator settings so at least 2 are active at all times
// they also handle calling the other methods to deal with the sliders lock status
gameSettings.addition.addEventListener("change", (element, event) => {
	if (gameSettings.addition.checked == false && countMenuChecked() <= 1) {
		if (gameSettings.subtraction.checked) {
			gameSettings.multiplication.checked = true
		} else {
			gameSettings.subtraction.checked = true
		}
	}
	lockSlider()
})

gameSettings.subtraction.addEventListener("change", (element, event) => {
	if (gameSettings.subtraction.checked == false && countMenuChecked() <= 1) {
		if (gameSettings.addition.checked) {
			gameSettings.multiplication.checked = true
		} else {
			gameSettings.addition.checked = true
		}
	}
	lockSlider()
})

gameSettings.multiplication.addEventListener("change", (element, event) => {
	if (gameSettings.multiplication.checked == false && countMenuChecked() <= 1) {
		if (gameSettings.subtraction.checked) {
			gameSettings.addition.checked = true
		} else {
			gameSettings.subtraction.checked = true
		}
	}
	lockSlider()
})

gameSettings.division.addEventListener("change", (element, event) => {
	if (gameSettings.division.checked == false && countMenuChecked() <= 1) {
		if (gameSettings.addition.checked) {
			gameSettings.multiplication.checked = true
		} else {
			gameSettings.addition.checked = true
		}
	}
	lockSlider()
})

gameSettings.size.addEventListener("change", lockSlider)

// start game button hides the menu and starts the game
gameSettings.start.addEventListener("click", (element, event) => {
	gameSettings.menu.classList=["hidden"]
	startGame()
})