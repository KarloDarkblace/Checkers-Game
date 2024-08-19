document.addEventListener("DOMContentLoaded", function() {
    const joinButton = document.querySelector(".join-button");
    const createRoomButton = document.querySelector(".create-room-button");
    const notification = document.getElementById("notification");
    const passwordField = document.getElementById("passwordInputField");
    const nicknameInput = document.getElementById("nickname");
    let selectedRoomRow = null;

    function isNicknameValid() {
        const nickname = nicknameInput.value.trim();
        return nickname.length >= 3;
    }

    document.querySelectorAll(".rooms-table tbody tr").forEach(row => {
        row.addEventListener("click", function() {
            document.querySelectorAll(".rooms-table tbody tr").forEach(r => r.classList.remove("selected"));
            row.classList.add("selected");
            selectedRoomRow = row;
            const lockIcon = row.querySelector("img.lock-icon");

            if (lockIcon) {
                passwordField.style.display = "block";
            } else {
                passwordField.style.display = "none";
            }
        });
    });

    joinButton.addEventListener("click", function() {
        if (!isNicknameValid()) {
            notification.textContent = "Nickname must be at least 3 characters!";
            notification.classList.add("show");
            setTimeout(() => notification.classList.remove("show"), 3000);
            return;
        }

        if (!selectedRoomRow) {
            notification.textContent = "Please select a room!";
            notification.classList.add("show");
            setTimeout(() => notification.classList.remove("show"), 3000);
        } else if (passwordField.style.display === "block") {
            const password = passwordField.value;
            if (password === "password") {
                console.log("Joining room with password...");
            } else {
                notification.textContent = "Incorrect password!";
                notification.classList.add("show");
                setTimeout(() => notification.classList.remove("show"), 3000);
            }
        } else {
            console.log("Joining room without password...");
        }
    });

    createRoomButton.addEventListener("click", function() {
        if (!isNicknameValid()) {
            notification.textContent = "Nickname must be at least 3 characters!";
            notification.classList.add("show");
            setTimeout(() => notification.classList.remove("show"), 3000);
            return;
        }

        console.log("Creating a new room...");
    });
});
