const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const claimList = document.getElementById("claimList");
const itemType = document.getElementById("itemType");
const privateDetailGroup = document.getElementById("privateDetailGroup");
const privateDetailInput = document.getElementById("privateDetail");
const searchInput = document.getElementById("searchInput");

let nextItemId = 4;
let nextClaimId = 1;
let activeFilter = "All";

let items = [
    {
        id: 1,
        name: "Water Bottle",
        type: "Found",
        location: "Library",
        description: "Blue water bottle found near a study table.",
        contact: "finder1@example.com",
        privateDetail: "Small star sticker on the bottom"
    },
    {
        id: 2,
        name: "Notebook",
        type: "Lost",
        location: "Block A",
        description: "A notebook with handwritten class notes.",
        contact: "student2@example.com",
        privateDetail: ""
    },
    {
        id: 3,
        name: "ID Card",
        type: "Found",
        location: "Canteen",
        description: "College ID card found near the entrance.",
        contact: "finder3@example.com",
        privateDetail: "Blue mark on the back"
    }
];

let claims = [];
let reports = [];

// Create an HTML element safely using textContent for user input.
function createElement(tag, text, className) {
    const element = document.createElement(tag);

    if (text !== undefined && text !== "") {
        element.textContent = text;
    }

    if (className) {
        element.className = className;
    }

    return element;
}

// Show the private-detail field only for found items.
function updatePrivateField() {
    const isFound = itemType.value === "Found";

    privateDetailGroup.hidden = !isFound;
    privateDetailInput.required = isFound;
}

itemType.addEventListener("change", updatePrivateField);
updatePrivateField();

// Display lost and found items.
function displayItems() {
    itemList.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchText) ||
            item.location.toLowerCase().includes(searchText) ||
            item.description.toLowerCase().includes(searchText);

        const matchesFilter =
            activeFilter === "All" || item.type === activeFilter;

        return matchesSearch && matchesFilter;
    });

    if (filteredItems.length === 0) {
        itemList.appendChild(
            createElement("p", "No matching items found.")
        );
        return;
    }

    filteredItems.forEach(item => {
        const card = createElement("article", "", "item-card");

        card.appendChild(createElement("h3", item.name));
        card.appendChild(createElement("span", item.type, "item-type"));
        card.appendChild(createElement("p", "Location: " + item.location));
        card.appendChild(
            createElement("p", "Description: " + item.description)
        );

        const contactLink = createElement("a", "Contact Reporter");
        contactLink.href =
            "mailto:" + item.contact +
            "?subject=" + encodeURIComponent("CVR Connect: " + item.name);

        card.appendChild(contactLink);

        if (item.type === "Found") {
            const claimButton = createElement("button", "Claim Item");
            claimButton.type = "button";

            claimButton.addEventListener("click", () => {
                showClaimForm(item, card);
            });

            card.appendChild(document.createElement("br"));
            card.appendChild(claimButton);
        }

        itemList.appendChild(card);
    });
}

// Add a new lost or found item.
itemForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newItem = {
        id: nextItemId++,
        name: document.getElementById("itemName").value.trim(),
        type: itemType.value,
        location: document.getElementById("itemLocation").value.trim(),
        description: document.getElementById("itemDescription").value.trim(),
        contact: document.getElementById("itemContact").value.trim(),
        privateDetail: itemType.value === "Found"
            ? privateDetailInput.value.trim()
            : ""
    };

    if (
        !newItem.name ||
        !newItem.location ||
        !newItem.description ||
        !newItem.contact
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    if (newItem.type === "Found" && !newItem.privateDetail) {
        alert("Please enter a private verification detail.");
        return;
    }

    items.unshift(newItem);

    itemForm.reset();
    updatePrivateField();
    displayItems();

    alert("Item reported successfully!");
});

// Search items while typing.
searchInput.addEventListener("input", displayItems);

// Filter lost and found items.
document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        displayItems();
    });
});

// Show a claim form for a found item.
function showClaimForm(item, card) {
    if (card.querySelector(".claim-form")) {
        return;
    }

    const form = createElement("form", "", "claim-form");

    form.appendChild(createElement("h4", "Claim: " + item.name));

    const nameLabel = createElement("label", "Your Name");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.required = true;
    nameInput.placeholder = "Enter your name";

    const contactLabel = createElement("label", "Your Contact Email");
    const contactInput = document.createElement("input");
    contactInput.type = "email";
    contactInput.required = true;
    contactInput.placeholder = "Enter your email";

    const proofLabel = createElement(
        "label",
        "Proof of Ownership"
    );

    const proofInput = document.createElement("textarea");
    proofInput.required = true;
    proofInput.placeholder =
        "Describe a unique mark, sticker, contents, or other identifying detail.";

    const submitButton = createElement("button", "Submit Claim");
    submitButton.type = "submit";

    const cancelButton = createElement("button", "Cancel");
    cancelButton.type = "button";
    cancelButton.addEventListener("click", () => form.remove());

    form.append(
        nameLabel, nameInput,
        contactLabel, contactInput,
        proofLabel, proofInput,
        submitButton, cancelButton
    );

    form.addEventListener("submit", event => {
        event.preventDefault();

        const claim = {
            id: nextClaimId++,
            itemId: item.id,
            itemName: item.name,
            claimantName: nameInput.value.trim(),
            claimantContact: contactInput.value.trim(),
            proof: proofInput.value.trim(),
            status: "Pending"
        };

        claims.push(claim);
        form.remove();
        displayClaims();

        alert("Claim submitted. Ownership must be verified before collection.");
    });

    card.appendChild(form);
}

// Display claims for review.
function displayClaims() {
    claimList.replaceChildren();

    if (claims.length === 0) {
        claimList.appendChild(
            createElement("p", "No claims submitted yet.")
        );
        return;
    }

    claims.forEach(claim => {
        const item = items.find(entry => entry.id === claim.itemId);
        const card = createElement("article", "", "claim-card");

        card.appendChild(createElement("h3", claim.itemName));
        card.appendChild(
            createElement("p", "Claimant: " + claim.claimantName)
        );
        card.appendChild(
            createElement("p", "Contact: " + claim.claimantContact)
        );
        card.appendChild(
            createElement("p", "Claimant's proof: " + claim.proof)
        );

        // This comparison detail is visible only as a demo interface.
        // A real system must protect it on a server.
        if (item) {
            card.appendChild(
                createElement(
                    "p",
                    "Private detail to compare: " + item.privateDetail
                )
            );
        }

        card.appendChild(
            createElement("p", "Status: " + claim.status, "status " +
                claim.status.toLowerCase())
        );

        if (claim.status === "Pending") {
            const approveButton = createElement("button", "Approve Claim");
            approveButton.type = "button";

            approveButton.addEventListener("click", () => {
                const confirmed = confirm(
                    "Have you checked the claimant's proof and verified ownership?"
                );

                if (!confirmed) return;

                claim.status = "Approved";
                displayClaims();

                alert(
                    "Claim approved in this demo. Arrange a safe handover."
                );
            });

            const rejectButton = createElement("button", "Reject Claim");
            rejectButton.type = "button";

            rejectButton.addEventListener("click", () => {
                if (!confirm("Are you sure you want to reject this claim?")) {
                    return;
                }

                claim.status = "Rejected";
                displayClaims();
            });

            card.append(approveButton, rejectButton);
        }

        claimList.appendChild(card);
    });
}

// CanteenPulse crowd reporting.
document.querySelectorAll("[data-crowd]").forEach(button => {
    button.addEventListener("click", () => {
        reports.push(button.dataset.crowd);
        updateCrowdStatus();
    });
});

function updateCrowdStatus() {
    const levels = ["Quiet", "Moderate", "Crowded"];
    const counts = {
        Quiet: 0,
        Moderate: 0,
        Crowded: 0
    };

    reports.forEach(level => counts[level]++);

    document.getElementById("reportCounts").textContent =
        "Quiet: " + counts.Quiet +
        " | Moderate: " + counts.Moderate +
        " | Crowded: " + counts.Crowded;

    const result = document.getElementById("crowdResult");

    if (reports.length === 0) {
        result.textContent = "No crowd reports yet.";
        result.className = "crowd-result";
        return;
    }

    const highestCount = Math.max(...Object.values(counts));

    // If there's a tie, use the most recently reported level among tied levels.
    const majorityLevels = levels.filter(
        level => counts[level] === highestCount
    );

    const status = [...reports].reverse().find(
        level => majorityLevels.includes(level)
    );

    const waitTimes = {
        Quiet: 3,
        Moderate: 10,
        Crowded: 20
    };

    result.textContent =
        "Current reported crowd: " + status +
        ". Estimated wait: " + waitTimes[status] + " minutes.";

    result.className = "crowd-result " + status.toLowerCase();
}

// Initial display.
displayItems();
displayClaims();