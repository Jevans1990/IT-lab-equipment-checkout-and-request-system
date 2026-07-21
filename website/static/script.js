document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "itLabCheckoutDemoState";

  const defaultInventory = [
    {
      name: "Laptop",
      category: "Computer",
      condition: "Good",
      quantity: 10,
      description: "General-use laptop for coursework, testing, and lab work.",
      checkoutDays: 7,
    },
    {
      name: "Camera Kit",
      category: "Media",
      condition: "Good",
      quantity: 6,
      description: "Camera, battery, charger, and carrying case for class projects.",
      checkoutDays: 5,
    },
    {
      name: "Keyboard",
      category: "Peripheral",
      condition: "Good",
      quantity: 15,
      description: "USB keyboard for lab stations, testing, or temporary checkout.",
      checkoutDays: 7,
    },
    {
      name: "Mouse",
      category: "Peripheral",
      condition: "Good",
      quantity: 20,
      description: "Wired mouse for lab stations and temporary student use.",
      checkoutDays: 7,
    },
    {
      name: "Cable",
      category: "Cable",
      condition: "Good",
      quantity: 40,
      description: "Common USB cables for charging, data transfer, and adapters.",
      checkoutDays: 3,
      cableTypes: ["USB-A to USB-C", "USB-C to USB-C", "Micro USB", "Mini USB"],
      cableLengths: ["4ft", "6ft", "8ft", "10ft"],
    },
    {
      name: "Wall Charger",
      category: "Charger",
      condition: "Good",
      quantity: 25,
      description: "Wall charger blocks for phones, tablets, and small devices.",
      checkoutDays: 3,
      chargerTypes: ["USB-A", "USB-C", "USB-C Fast Charging"],
    },
    {
      name: "Car Charger",
      category: "Charger",
      condition: "Good",
      quantity: 18,
      description: "Vehicle charger for mobile devices during travel or field work.",
      checkoutDays: 3,
      chargerTypes: ["USB-A", "USB-C"],
    },
    {
      name: "Adapter Kit",
      category: "Kit",
      condition: "Good",
      quantity: 4,
      description: "Mixed adapter kit with HDMI, USB-C, Ethernet, and display adapters.",
      checkoutDays: 5,
    },
  ];

  let currentUser = getBackendUser();
  let cart = [];
  let rentalRequests = [];
  let rentalHistory = [];
  let inventory = cloneData(defaultInventory);

  const inventoryGrid = document.getElementById("inventory-grid");
  const adminSection = document.getElementById("admin-section");
  const userRentalsSection = document.getElementById("user-rentals-section");
  const userRentalsList = document.getElementById("user-rentals-list");
  const userRoleLabel = document.getElementById("user-role-label");

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const cartBtn = document.getElementById("cart-btn");
  const cartCountSpan = document.getElementById("cart-count");

  const loginModal = document.getElementById("login-modal");
  const loginCancelBtn = document.getElementById("login-cancel");

  const cartModal = document.getElementById("cart-modal");
  const cartItemsDiv = document.getElementById("cart-items");
  const cartCloseBtn = document.getElementById("cart-close");
  const clearCartBtn = document.getElementById("clear-cart");
  const submitRentalRequestBtn = document.getElementById("submit-rental-request");

  const notificationModal = document.getElementById("notification-modal");
  const notificationText = document.getElementById("notification-text");
  const notificationCloseBtn = document.getElementById("notification-close");

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const requestsListDiv = document.getElementById("requests-list");
  const rentalHistoryListDiv = document.getElementById("rental-history-list");

  const addItemNameInput = document.getElementById("add-item-name");
  const addItemCategoryInput = document.getElementById("add-item-category");
  const addItemConditionSelect = document.getElementById("add-item-condition");
  const addItemQtyInput = document.getElementById("add-item-qty");
  const addItemDescriptionInput = document.getElementById("add-item-description");
  const addItemCheckoutDaysInput = document.getElementById("add-item-checkout-days");
  const addItemBtn = document.getElementById("add-item-btn");
  const clearAddItemBtn = document.getElementById("clear-add-item-btn");

  const updateItemSelect = document.getElementById("update-item-select");
  const updateItemNameInput = document.getElementById("update-item-name");
  const updateItemCategoryInput = document.getElementById("update-item-category");
  const updateItemConditionSelect = document.getElementById("update-item-condition");
  const updateItemQtyInput = document.getElementById("update-item-qty");
  const updateItemDescriptionInput = document.getElementById("update-item-description");
  const updateItemCheckoutDaysInput = document.getElementById("update-item-checkout-days");
  const updateItemBtn = document.getElementById("update-item-btn");
  const resetUpdateItemBtn = document.getElementById("reset-update-item-btn");

  const deleteItemNameInput = document.getElementById("delete-item-name");
  const deleteItemBtn = document.getElementById("delete-item-btn");

  const damageItemNameInput = document.getElementById("damage-item-name");
  const damageSerialInput = document.getElementById("damage-serial-number");
  const damageItemNumberInput = document.getElementById("damage-item-number");
  const damageItemBtn = document.getElementById("damage-item-btn");

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeBackendRole(role) {
    const cleanRole = String(role || "").trim().toLowerCase();

    if (cleanRole === "admin" || cleanRole === "manager" || cleanRole === "lab admin") {
      return "admin";
    }

    return "user";
  }

  function getBackendUser() {
    const auth = window.BACKEND_AUTH || {};

    if (!auth.isAuthenticated) {
      return null;
    }

    return {
      username: auth.username || "User",
      role: normalizeBackendRole(auth.role),
    };
  }

  function syncAuthUI() {
    currentUser = getBackendUser();

    if (currentUser) {
      userRoleLabel.textContent = `Logged in as ${currentUser.username} (${currentUser.role})`;
      logoutBtn.classList.remove("hidden");
      loginBtn.classList.add("hidden");

      if (currentUser.role === "admin") {
        adminSection.classList.remove("hidden");
        userRentalsSection.classList.add("hidden");
        refreshAdminSelectors();
      } else {
        adminSection.classList.add("hidden");
      }
    } else {
      userRoleLabel.textContent = "Not logged in";
      logoutBtn.classList.add("hidden");
      loginBtn.classList.remove("hidden");
      adminSection.classList.add("hidden");
      userRentalsSection.classList.add("hidden");
    }
  }

  function parsePositiveInt(value, fallback = 1) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function getCheckoutDaysFromOldRentalOptions(item) {
    if (!Array.isArray(item.rentalOptions)) {
      return 7;
    }

    if (item.rentalOptions.some((option) => option.period === "Week")) {
      return 7;
    }

    if (item.rentalOptions.some((option) => option.period === "Weekend")) {
      return 3;
    }

    return 1;
  }

  function normalizeInventoryItem(item) {
    return {
      name: item.name || "Unnamed Item",
      category: item.category || "General",
      condition: item.condition || "Good",
      quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0,
      description: item.description || "No description provided.",
      checkoutDays: parsePositiveInt(item.checkoutDays, getCheckoutDaysFromOldRentalOptions(item)),
      cableTypes: Array.isArray(item.cableTypes) ? item.cableTypes : undefined,
      cableLengths: Array.isArray(item.cableLengths) ? item.cableLengths : undefined,
      chargerTypes: Array.isArray(item.chargerTypes) ? item.chargerTypes : undefined,
    };
  }

  function normalizeRequestItem(item) {
    const periodDays = {
      Day: 1,
      Weekend: 3,
      Week: 7,
    };

    return {
      itemName: item.itemName || item.name || "Unknown Item",
      checkoutDays: parsePositiveInt(item.checkoutDays, periodDays[item.rentalPeriod] || 7),
      extra: item.extra || {},
    };
  }

  function normalizeRequest(request) {
    return {
      ...request,
      items: Array.isArray(request.items) ? request.items.map(normalizeRequestItem) : [],
    };
  }

  function findInventoryItem(name) {
    return inventory.find((item) => item.name.toLowerCase() === String(name).toLowerCase());
  }

  function sortInventory() {
    inventory.sort((a, b) => a.name.localeCompare(b.name));
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const data = JSON.parse(saved);
      inventory = Array.isArray(data.inventory) ? data.inventory.map(normalizeInventoryItem) : inventory;
      rentalRequests = Array.isArray(data.rentalRequests) ? data.rentalRequests.map(normalizeRequest) : rentalRequests;
      rentalHistory = Array.isArray(data.rentalHistory) ? data.rentalHistory.map(normalizeRequest) : rentalHistory;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inventory,
        rentalRequests,
        rentalHistory,
      })
    );
  }

  function showModal(modal) {
    modal.classList.remove("hidden");
  }

  function hideModal(modal) {
    modal.classList.add("hidden");
  }

  function showNotification(message) {
    notificationText.textContent = message;
    showModal(notificationModal);
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not set";
    }

    const date = new Date(dateValue);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDays(days) {
    const parsedDays = parsePositiveInt(days, 1);
    return `${parsedDays} ${parsedDays === 1 ? "day" : "days"}`;
  }

  function getCheckoutDays(items) {
    return items.reduce((maxDays, item) => Math.max(maxDays, parsePositiveInt(item.checkoutDays, 1)), 1);
  }

  function getDueDate(items) {
    const due = new Date();
    due.setDate(due.getDate() + getCheckoutDays(items));
    return due.toISOString();
  }

  function getAvailabilityStatus(item) {
    const condition = String(item.condition || "").toLowerCase();

    if (item.quantity <= 0) {
      return { label: "Unavailable", className: "unavailable" };
    }

    if (condition.includes("damaged")) {
      return { label: "Damaged", className: "damaged" };
    }

    if (condition.includes("repair")) {
      return { label: "Under Repair", className: "low-stock" };
    }

    if (condition.includes("unavailable")) {
      return { label: "Unavailable", className: "unavailable" };
    }

    if (item.quantity <= 3) {
      return { label: "Low Stock", className: "low-stock" };
    }

    return { label: "Available", className: "available" };
  }

  function normalizeStatus(status, dueDateISO) {
    if (status === "approved" && dueDateISO && new Date(dueDateISO) < new Date()) {
      return "overdue";
    }

    return status;
  }

  function statusBadge(status, dueDateISO) {
    const normalized = normalizeStatus(status || "pending", dueDateISO);
    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return `<span class="badge ${escapeHTML(normalized)}">${escapeHTML(label)}</span>`;
  }

  function getExtraDescription(extra) {
    if (!extra || Object.keys(extra).length === 0) {
      return "";
    }

    const parts = [];
    if (extra.cableType) {
      parts.push(`Type: ${extra.cableType}`);
    }
    if (extra.cableLength) {
      parts.push(`Length: ${extra.cableLength}`);
    }
    if (extra.chargerType) {
      parts.push(`Type: ${extra.chargerType}`);
    }

    return parts.length ? ` (${parts.join(" | ")})` : "";
  }

  function renderItemList(items) {
    return `
      <ul class="item-list">
        ${items
          .map(
            (item) =>
              `<li>${escapeHTML(item.itemName)} - ${escapeHTML(formatDays(item.checkoutDays))} checkout${escapeHTML(getExtraDescription(item.extra))}</li>`
          )
          .join("")}
      </ul>
    `;
  }

  function updateCartCount() {
    cartCountSpan.textContent = cart.length;
    submitRentalRequestBtn.disabled = cart.length === 0;
    clearCartBtn.disabled = cart.length === 0;
  }

  function renderInventory() {
    inventoryGrid.innerHTML = "";
    sortInventory();

    inventory.forEach((rawItem) => {
      const item = normalizeInventoryItem(rawItem);
      const status = getAvailabilityStatus(item);
      const card = document.createElement("article");
      card.className = "equipment-card";

      card.innerHTML = `
        <div class="card-top">
          <div>
            <h3 class="item-title">${escapeHTML(item.name)}</h3>
            <p class="item-category">${escapeHTML(item.category || "General Equipment")}</p>
          </div>
          <span class="badge ${escapeHTML(status.className)}">${escapeHTML(status.label)}</span>
        </div>

        <p class="record-meta">${escapeHTML(item.description || "No description provided.")}</p>

        <div class="detail-list">
          <div><span>Available:</span> ${escapeHTML(item.quantity)}</div>
          <div><span>Condition:</span> ${escapeHTML(item.condition || "Good")}</div>
          <div><span>Default Checkout:</span> ${escapeHTML(formatDays(item.checkoutDays))}</div>
        </div>
      `;

      if (!currentUser || currentUser.role === "user") {
        const formStack = document.createElement("div");
        formStack.className = "option-stack";

        const daysLabel = document.createElement("label");
        daysLabel.textContent = "Requested checkout days";
        const daysInput = document.createElement("input");
        daysInput.type = "number";
        daysInput.min = "1";
        daysInput.max = "60";
        daysInput.value = item.checkoutDays;
        daysInput.className = "checkout-days-input";
        daysLabel.appendChild(daysInput);
        formStack.appendChild(daysLabel);

        let cableTypeSelect = null;
        let cableLengthSelect = null;
        let chargerTypeSelect = null;

        if (Array.isArray(item.cableTypes) && item.cableTypes.length > 0) {
          const cableTypeLabel = document.createElement("label");
          cableTypeLabel.textContent = "Cable type";
          cableTypeSelect = document.createElement("select");
          item.cableTypes.forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            cableTypeSelect.appendChild(option);
          });
          cableTypeLabel.appendChild(cableTypeSelect);
          formStack.appendChild(cableTypeLabel);

          const cableLengthLabel = document.createElement("label");
          cableLengthLabel.textContent = "Cable length";
          cableLengthSelect = document.createElement("select");
          const lengths = Array.isArray(item.cableLengths) && item.cableLengths.length > 0 ? item.cableLengths : ["6ft"];
          lengths.forEach((length) => {
            const option = document.createElement("option");
            option.value = length;
            option.textContent = length;
            cableLengthSelect.appendChild(option);
          });
          cableLengthLabel.appendChild(cableLengthSelect);
          formStack.appendChild(cableLengthLabel);
        }

        if (Array.isArray(item.chargerTypes) && item.chargerTypes.length > 0) {
          const chargerLabel = document.createElement("label");
          chargerLabel.textContent = "Charger type";
          chargerTypeSelect = document.createElement("select");
          item.chargerTypes.forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            chargerTypeSelect.appendChild(option);
          });
          chargerLabel.appendChild(chargerTypeSelect);
          formStack.appendChild(chargerLabel);
        }

        const actions = document.createElement("div");
        actions.className = "card-actions";
        const addButton = document.createElement("button");
        addButton.className = "primary-btn request-card-btn";
        addButton.textContent = currentUser ? "Add to Request" : "Log In to Request";
        addButton.disabled = item.quantity <= 0 || status.className === "damaged" || status.className === "unavailable";

        addButton.addEventListener("click", () => {
          if (!currentUser) {
            showNotification("Please log in before requesting equipment.");
            showModal(loginModal);
            return;
          }

          const checkoutDays = parsePositiveInt(daysInput.value, item.checkoutDays);
          if (checkoutDays < 1 || checkoutDays > 60) {
            showNotification("Please enter a checkout length between 1 and 60 days.");
            return;
          }

          const extra = {};
          if (cableTypeSelect && cableLengthSelect) {
            extra.cableType = cableTypeSelect.value;
            extra.cableLength = cableLengthSelect.value;
          }
          if (chargerTypeSelect) {
            extra.chargerType = chargerTypeSelect.value;
          }

          cart.push({
            itemName: item.name,
            checkoutDays,
            extra,
          });

          updateCartCount();
          showNotification(`${item.name} was added to your request list.`);
        });

        actions.appendChild(addButton);
        card.appendChild(formStack);
        card.appendChild(actions);
      } else {
        const adminDetails = document.createElement("div");
        adminDetails.className = "detail-list";
        adminDetails.innerHTML = `
          <div><span>Default Checkout:</span> ${escapeHTML(formatDays(item.checkoutDays))}</div>
        `;
        card.appendChild(adminDetails);
      }

      inventoryGrid.appendChild(card);
    });
  }

  function renderCart() {
    cartItemsDiv.innerHTML = "";
    updateCartCount();

    if (cart.length === 0) {
      cartItemsDiv.innerHTML = `<div class="empty-state">Your request list is empty.</div>`;
      return;
    }

    cart.forEach((item, index) => {
      const normalizedItem = normalizeRequestItem(item);
      const card = document.createElement("div");
      card.className = "record-card";
      card.innerHTML = `
        <div class="record-header">
          <div>
            <p class="record-title">${escapeHTML(normalizedItem.itemName)}</p>
            <p class="record-meta">Checkout length: ${escapeHTML(formatDays(normalizedItem.checkoutDays))}${escapeHTML(getExtraDescription(normalizedItem.extra))}</p>
          </div>
        </div>
      `;

      const actions = document.createElement("div");
      actions.className = "record-actions";
      const removeButton = document.createElement("button");
      removeButton.className = "remove-btn";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        cart.splice(index, 1);
        renderCart();
        updateCartCount();
      });
      actions.appendChild(removeButton);
      card.appendChild(actions);
      cartItemsDiv.appendChild(card);
    });
  }

  function submitRentalRequest() {
    if (!currentUser || currentUser.role !== "user") {
      showNotification("You must be logged in as a user to submit a rental request.");
      return;
    }

    if (cart.length === 0) {
      showNotification("Your request list is empty.");
      return;
    }

    const request = {
      id: Date.now(),
      username: currentUser.username,
      items: cart.map(normalizeRequestItem),
      status: "pending",
      requestDateISO: new Date().toISOString(),
    };

    rentalRequests.push(request);
    cart = [];
    saveState();
    updateCartCount();
    renderCart();
    renderRequests();
    showNotification("Your rental request was submitted and is pending admin approval.");
  }

  function renderRequests() {
    requestsListDiv.innerHTML = "";

    if (rentalRequests.length === 0) {
      requestsListDiv.innerHTML = `<div class="empty-state">No rental requests yet.</div>`;
      return;
    }

    rentalRequests
      .slice()
      .reverse()
      .forEach((request) => {
        const card = document.createElement("div");
        card.className = "record-card";
        card.innerHTML = `
          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(request.id)}</p>
              <p class="record-meta">Borrower: ${escapeHTML(request.username)} | Requested: ${escapeHTML(formatDate(request.requestDateISO))}</p>
              ${request.dueDateISO ? `<p class="record-meta">Due: ${escapeHTML(formatDate(request.dueDateISO))}</p>` : ""}
            </div>
            ${statusBadge(request.status, request.dueDateISO)}
          </div>
          ${renderItemList(request.items)}
        `;

        if (request.status === "pending") {
          const actions = document.createElement("div");
          actions.className = "request-actions";

          const approveButton = document.createElement("button");
          approveButton.className = "approve-btn";
          approveButton.textContent = "Approve";
          approveButton.addEventListener("click", () => approveRequest(request.id));

          const denyButton = document.createElement("button");
          denyButton.className = "deny-btn";
          denyButton.textContent = "Deny";
          denyButton.addEventListener("click", () => denyRequest(request.id));

          actions.appendChild(approveButton);
          actions.appendChild(denyButton);
          card.appendChild(actions);
        }

        requestsListDiv.appendChild(card);
      });
  }

  function hasEnoughInventory(items) {
    const requestedCounts = {};
    items.forEach((item) => {
      requestedCounts[item.itemName] = (requestedCounts[item.itemName] || 0) + 1;
    });

    return Object.entries(requestedCounts).every(([itemName, count]) => {
      const inventoryItem = findInventoryItem(itemName);
      const status = inventoryItem ? getAvailabilityStatus(inventoryItem) : null;
      return inventoryItem && inventoryItem.quantity >= count && status.className !== "damaged" && status.className !== "unavailable";
    });
  }

  function approveRequest(id) {
    const request = rentalRequests.find((entry) => entry.id === id);
    if (!request) {
      return;
    }

    if (!hasEnoughInventory(request.items)) {
      showNotification("This request cannot be approved because one or more items are no longer available.");
      return;
    }

    request.items.forEach((requestedItem) => {
      const inventoryItem = findInventoryItem(requestedItem.itemName);
      if (inventoryItem) {
        inventoryItem.quantity -= 1;
      }
    });

    request.status = "approved";
    request.approvedDateISO = new Date().toISOString();
    request.dueDateISO = getDueDate(request.items);

    rentalHistory.push({
      id: request.id,
      username: request.username,
      items: request.items.map(normalizeRequestItem),
      status: "approved",
      requestDateISO: request.requestDateISO,
      approvedDateISO: request.approvedDateISO,
      dueDateISO: request.dueDateISO,
      returnedDateISO: null,
    });

    saveState();
    refreshAdminSelectors(request.items[0]?.itemName || "");
    renderInventory();
    renderRequests();
    renderRentalHistory();
    renderUserRentals();
    showNotification(`Request #${id} approved. Due date: ${formatDate(request.dueDateISO)}.`);
  }

  function denyRequest(id) {
    const request = rentalRequests.find((entry) => entry.id === id);
    if (!request) {
      return;
    }

    request.status = "denied";
    request.deniedDateISO = new Date().toISOString();

    rentalHistory.push({
      id: request.id,
      username: request.username,
      items: request.items.map(normalizeRequestItem),
      status: "denied",
      requestDateISO: request.requestDateISO,
      deniedDateISO: request.deniedDateISO,
    });

    saveState();
    renderRequests();
    renderRentalHistory();
    renderUserRentals();
    showNotification(`Request #${id} was denied.`);
  }

  function markReturned(id) {
    const historyEntry = rentalHistory.find((entry) => entry.id === id && entry.status === "approved");
    if (!historyEntry) {
      return;
    }

    historyEntry.items.forEach((returnedItem) => {
      const inventoryItem = findInventoryItem(returnedItem.itemName);
      if (inventoryItem) {
        inventoryItem.quantity += 1;
      }
    });

    historyEntry.status = "returned";
    historyEntry.returnedDateISO = new Date().toISOString();

    const request = rentalRequests.find((entry) => entry.id === id);
    if (request) {
      request.status = "returned";
    }

    saveState();
    refreshAdminSelectors();
    renderInventory();
    renderRequests();
    renderRentalHistory();
    renderUserRentals();
    showNotification(`Request #${id} was marked as returned.`);
  }

  function renderRentalHistory() {
    rentalHistoryListDiv.innerHTML = "";

    if (rentalHistory.length === 0) {
      rentalHistoryListDiv.innerHTML = `<div class="empty-state">No rental history yet.</div>`;
      return;
    }

    rentalHistory
      .slice()
      .reverse()
      .forEach((entry) => {
        const normalizedStatus = normalizeStatus(entry.status, entry.dueDateISO);
        const card = document.createElement("div");
        card.className = "record-card";
        card.innerHTML = `
          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(entry.id)} - ${escapeHTML(entry.username)}</p>
              <p class="record-meta">Requested: ${escapeHTML(formatDate(entry.requestDateISO))}</p>
              <p class="record-meta">Due: ${entry.dueDateISO ? escapeHTML(formatDate(entry.dueDateISO)) : "Not assigned"}</p>
              ${entry.returnedDateISO ? `<p class="record-meta">Returned: ${escapeHTML(formatDate(entry.returnedDateISO))}</p>` : ""}
            </div>
            ${statusBadge(entry.status, entry.dueDateISO)}
          </div>
          ${renderItemList(entry.items)}
        `;

        if (normalizedStatus === "approved" || normalizedStatus === "overdue") {
          const actions = document.createElement("div");
          actions.className = "record-actions";
          const returnButton = document.createElement("button");
          returnButton.textContent = "Process Return";
          returnButton.className = "return-btn";
          returnButton.addEventListener("click", () => markReturned(entry.id));
          actions.appendChild(returnButton);
          card.appendChild(actions);
        }

        rentalHistoryListDiv.appendChild(card);
      });
  }

  function renderUserRentals() {
    if (!currentUser || currentUser.role !== "user") {
      userRentalsSection.classList.add("hidden");
      return;
    }

    userRentalsSection.classList.remove("hidden");
    userRentalsList.innerHTML = "";

    const userEntries = rentalHistory.filter((entry) => entry.username === currentUser.username);
    if (userEntries.length === 0) {
      userRentalsList.innerHTML = `<div class="empty-state">You have no rentals yet.</div>`;
      return;
    }

    userEntries
      .slice()
      .reverse()
      .forEach((entry) => {
        const card = document.createElement("div");
        card.className = "record-card";
        card.innerHTML = `
          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(entry.id)}</p>
              <p class="record-meta">Due: ${entry.dueDateISO ? escapeHTML(formatDate(entry.dueDateISO)) : "Not assigned"}</p>
              ${entry.returnedDateISO ? `<p class="record-meta">Returned: ${escapeHTML(formatDate(entry.returnedDateISO))}</p>` : ""}
            </div>
            ${statusBadge(entry.status, entry.dueDateISO)}
          </div>
          ${renderItemList(entry.items)}
        `;
        userRentalsList.appendChild(card);
      });
  }

  function handleLogout() {
    window.location.href = window.BACKEND_AUTH?.logoutUrl || "/logout";
  }

  function getItemFormData(mode) {
    const prefix = mode === "add" ? "add" : "update";
    const fields = {
      name: document.getElementById(`${prefix}-item-name`).value.trim(),
      category: document.getElementById(`${prefix}-item-category`).value.trim(),
      condition: document.getElementById(`${prefix}-item-condition`).value,
      quantity: Number.parseInt(document.getElementById(`${prefix}-item-qty`).value, 10),
      description: document.getElementById(`${prefix}-item-description`).value.trim(),
      checkoutDays: Number.parseInt(document.getElementById(`${prefix}-item-checkout-days`).value, 10),
    };

    if (!fields.name || !fields.category || !fields.description) {
      showNotification("Please fill out item name, category, and description.");
      return null;
    }

    if (Number.isNaN(fields.quantity) || fields.quantity < 0) {
      showNotification("Please enter a valid quantity of 0 or higher.");
      return null;
    }

    if (Number.isNaN(fields.checkoutDays) || fields.checkoutDays < 1 || fields.checkoutDays > 60) {
      showNotification("Please enter a default checkout length between 1 and 60 days.");
      return null;
    }

    return fields;
  }

  function applyItemFields(item, fields) {
    item.name = fields.name;
    item.category = fields.category;
    item.condition = fields.condition;
    item.quantity = fields.quantity;
    item.description = fields.description;
    item.checkoutDays = fields.checkoutDays;
  }

  function clearAddItemForm() {
    addItemNameInput.value = "";
    addItemCategoryInput.value = "";
    addItemConditionSelect.value = "Good";
    addItemQtyInput.value = "";
    addItemDescriptionInput.value = "";
    addItemCheckoutDaysInput.value = "";
  }

  function addItem() {
    const fields = getItemFormData("add");
    if (!fields) {
      return;
    }

    if (findInventoryItem(fields.name)) {
      showNotification(`${fields.name} already exists. Use the Update Item section to edit it.`);
      return;
    }

    const newItem = {};
    applyItemFields(newItem, fields);
    inventory.push(newItem);
    sortInventory();
    clearAddItemForm();
    saveState();
    refreshAdminSelectors(fields.name);
    renderInventory();
    showNotification(`${fields.name} was added to inventory.`);
  }

  function populateItemSelect(selectElement, placeholder) {
    const selectedValue = selectElement.value;
    selectElement.innerHTML = "";

    if (placeholder) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = placeholder;
      selectElement.appendChild(option);
    }

    inventory.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = item.name;
      selectElement.appendChild(option);
    });

    if (selectedValue && inventory.some((item) => item.name === selectedValue)) {
      selectElement.value = selectedValue;
    }
  }

  function refreshAdminSelectors(preferredUpdateName = "") {
    sortInventory();
    populateItemSelect(updateItemSelect, "Select an item to edit");
    populateItemSelect(deleteItemNameInput, "Select an item to delete");
    populateItemSelect(damageItemNameInput, "Select an item to damage out");

    if (preferredUpdateName && inventory.some((item) => item.name === preferredUpdateName)) {
      updateItemSelect.value = preferredUpdateName;
    }

    populateUpdateForm();
  }

  function setUpdateFieldsDisabled(disabled) {
    updateItemNameInput.disabled = disabled;
    updateItemCategoryInput.disabled = disabled;
    updateItemConditionSelect.disabled = disabled;
    updateItemQtyInput.disabled = disabled;
    updateItemDescriptionInput.disabled = disabled;
    updateItemCheckoutDaysInput.disabled = disabled;
    updateItemBtn.disabled = disabled;
    resetUpdateItemBtn.disabled = disabled;
  }

  function clearUpdateForm() {
    updateItemNameInput.value = "";
    updateItemCategoryInput.value = "";
    updateItemConditionSelect.value = "Good";
    updateItemQtyInput.value = "";
    updateItemDescriptionInput.value = "";
    updateItemCheckoutDaysInput.value = "";
  }

  function populateUpdateForm() {
    const item = findInventoryItem(updateItemSelect.value);

    if (!item) {
      clearUpdateForm();
      setUpdateFieldsDisabled(true);
      return;
    }

    updateItemNameInput.value = item.name;
    updateItemCategoryInput.value = item.category || "General";
    updateItemConditionSelect.value = item.condition || "Good";
    updateItemQtyInput.value = item.quantity;
    updateItemDescriptionInput.value = item.description || "";
    updateItemCheckoutDaysInput.value = parsePositiveInt(item.checkoutDays, 7);
    setUpdateFieldsDisabled(false);
  }

  function updateItem() {
    const originalName = updateItemSelect.value;
    const item = findInventoryItem(originalName);

    if (!item) {
      showNotification("Please select an item to update.");
      return;
    }

    const fields = getItemFormData("update");
    if (!fields) {
      return;
    }

    const duplicateItem = findInventoryItem(fields.name);
    if (duplicateItem && duplicateItem !== item) {
      showNotification(`Another item named ${fields.name} already exists.`);
      return;
    }

    applyItemFields(item, fields);

    rentalRequests.forEach((request) => {
      request.items.forEach((requestItem) => {
        if (requestItem.itemName === originalName) {
          requestItem.itemName = fields.name;
        }
      });
    });

    rentalHistory.forEach((entry) => {
      entry.items.forEach((historyItem) => {
        if (historyItem.itemName === originalName) {
          historyItem.itemName = fields.name;
        }
      });
    });

    cart.forEach((cartItem) => {
      if (cartItem.itemName === originalName) {
        cartItem.itemName = fields.name;
      }
    });

    sortInventory();
    saveState();
    refreshAdminSelectors(fields.name);
    renderInventory();
    renderRequests();
    renderRentalHistory();
    renderUserRentals();
    updateCartCount();
    showNotification(`${fields.name} was updated.`);
  }

  function deleteItem() {
    const name = deleteItemNameInput.value.trim();
    if (!name) {
      showNotification("Please select an item to delete.");
      return;
    }

    const originalLength = inventory.length;
    inventory = inventory.filter((item) => item.name.toLowerCase() !== name.toLowerCase());

    if (inventory.length === originalLength) {
      showNotification(`No item named ${name} was found.`);
      return;
    }

    cart = cart.filter((item) => item.itemName.toLowerCase() !== name.toLowerCase());
    saveState();
    updateCartCount();
    refreshAdminSelectors();
    renderInventory();
    renderCart();
    showNotification(`All ${name} inventory records were deleted.`);
  }

  function damageItem() {
    const name = damageItemNameInput.value.trim();
    const serialNumber = damageSerialInput.value.trim();
    const itemNumber = damageItemNumberInput.value.trim();

    if (!name || !serialNumber || !itemNumber) {
      showNotification("Please fill out all damage-out fields.");
      return;
    }

    const item = findInventoryItem(name);
    if (!item) {
      showNotification(`No item named ${name} was found.`);
      return;
    }

    if (item.quantity <= 0) {
      showNotification(`${name} already has no available quantity to damage out.`);
      return;
    }

    item.quantity -= 1;

    if (item.quantity === 0) {
      item.condition = "Damaged / Unavailable";
    }

    damageSerialInput.value = "";
    damageItemNumberInput.value = "";

    saveState();
    refreshAdminSelectors(name);
    renderInventory();
    showNotification(`${name} with serial ${serialNumber} and item number ${itemNumber} was damaged out.`);
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      tabButtons.forEach((tabButton) => tabButton.classList.remove("active"));
      tabContents.forEach((tabContent) => tabContent.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      if (targetTab === "update-item-tab" || targetTab === "modify-items-tab") {
        refreshAdminSelectors();
      }
    });
  });

  loginBtn.addEventListener("click", () => showModal(loginModal));
  loginCancelBtn.addEventListener("click", () => hideModal(loginModal));
  logoutBtn.addEventListener("click", handleLogout);

  cartBtn.addEventListener("click", () => {
    renderCart();
    showModal(cartModal);
  });

  cartCloseBtn.addEventListener("click", () => hideModal(cartModal));
  submitRentalRequestBtn.addEventListener("click", submitRentalRequest);
  clearCartBtn.addEventListener("click", () => {
    cart = [];
    renderCart();
    updateCartCount();
  });

  notificationCloseBtn.addEventListener("click", () => hideModal(notificationModal));

  [loginModal, cartModal, notificationModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        hideModal(modal);
      }
    });
  });

  addItemBtn.addEventListener("click", addItem);
  clearAddItemBtn.addEventListener("click", clearAddItemForm);
  updateItemSelect.addEventListener("change", populateUpdateForm);
  updateItemBtn.addEventListener("click", updateItem);
  resetUpdateItemBtn.addEventListener("click", populateUpdateForm);
  deleteItemBtn.addEventListener("click", deleteItem);
  damageItemBtn.addEventListener("click", damageItem);

  loadState();
  inventory = inventory.map(normalizeInventoryItem);
  rentalRequests = rentalRequests.map(normalizeRequest);
  rentalHistory = rentalHistory.map(normalizeRequest);
  sortInventory();
  updateCartCount();
  syncAuthUI();
  refreshAdminSelectors();
  renderInventory();
  renderRequests();
  renderRentalHistory();
  renderUserRentals();
});