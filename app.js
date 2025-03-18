function copyEmail() {
    const emailText = document.querySelector(".email-text").innerText;
    const copyButton = document.querySelector(".copy h4"); // "Copy" text (desktop)
    const copyIcon = document.querySelector(".copy i"); // Copy icon (mobile)

    navigator.clipboard.writeText(emailText).then(() => {
        // Change text (desktop) and icon (mobile)
        copyButton.innerText = "Copied"; // Change "Copy" to "Copied"
        copyIcon.classList.remove("fa-copy"); // Remove copy icon
        copyIcon.classList.add("fa-check"); // Add tick icon

        // Revert back after 5 seconds
        setTimeout(() => {
            copyButton.innerText = "Copy";
            copyIcon.classList.remove("fa-check");
            copyIcon.classList.add("fa-copy");
        }, 5000);
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
}
