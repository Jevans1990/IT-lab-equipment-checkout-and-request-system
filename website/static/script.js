document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "itLabCheckoutDemoState";
  const routes = window.BACKEND_ROUTES || {};
  const backendData = window.BACKEND_DATA || {};

  const defaultInventory = [
    {
      id: "demo-laptop",
      name: "Laptop",
      category: "Computer",
      condition: "Good",
      quantity: 10,
      description: "General-use laptop for coursework, testing, and lab work.",
      checkoutDays: 7,
    },
    {
      id: "demo-camera-kit",
      name: "Camera Kit",
      category: "Media",
      condition: "Good",
      quantity: 6,
      description: "Camera, battery, charger, and carrying case for class projects.",
      checkoutDays: 5,
    },
    {
      id: "demo-keyboard",
      name: "Keyboard",
      category: "Peripheral",
      condition: "Good",
      quantity: 15,
      description: "USB keyboard for lab stations, testing, or temporary checkout.",
      checkoutDays: 7,
    },
    {
      id: "demo-mouse",
      name: "Mouse",
      category: "Peripheral",
      condition: "Good",
      quantity: 20,
      description: "Wired mouse for lab stations and temporary student use.",
      checkoutDays: 7,
    },
    {
      id: "demo-cable",
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
      id: "demo-wall-charger",
      name: "Wall Charger",
      category: "Charger",
      condition: "Good",
      quantity: 25,
      description: "Wall charger blocks for phones, tablets, and small devices.",
      checkoutDays: 3,
      chargerTypes: ["USB-A", "USB-C", "USB-C Fast Charging"],
    },
    {
      id: "demo-car-charger",
      name: "Car Charger",
      category: "Charger",
      condition: "Good",
      quantity: 18,
      description: "Vehicle charger for mobile devices during travel or field work.",
      checkoutDays: 3,
      chargerTypes: ["USB-A", "USB-C"],
    },
    {
      id: "demo-adapter-kit",
      name: "Adapter Kit",
      category: "Kit",
      condition: "Good",
      quantity: 4,
      description: "Mixed adapter kit with HDMI, USB-C, Ethernet, and display adapters.",
      checkoutDays: 5,
    },
  ];

  let currentUser = getBackendUser();
  let inventory = defaultInventory.map(normalizeInventoryItem);
  let cart = [];
  let rentalRequests = [];
  let rentalHistory = [];

  const inventoryGrid = document.getElementById("inventory-grid");
  const adminSection = document.getElementById("admin-section");
  const userRequestsSection = document.getElementById("user-requests-section");
  const userPendingList = document.getElementById("user-pending-list");
  const userRentalsSection = document.getElementById("user-rentals-section");
  const userRentalsList = document.getElementById("user-rentals-list");
  const userRoleLabel = document.getElementById("user-role-label");

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const cartBtn = document.getElementById("cart-btn");
  const cartCountSpan = document.getElementById("cart-count");

  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const loginSubmitBtn = document.getElementById("login-submit");
  const loginCancelBtn = document.getElementById("login-cancel");
  const loginError = document.getElementById("login-error");

  const cartModal = document.getElementById("cart-modal");
  const requestForm = document.getElementById("request-form");
  const requestHiddenFields = document.getElementById("request-hidden-fields");
  const requestTotal = document.getElementById("request-total");
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

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toInteger(value, fallback = 0) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? number : fallback;
  }

  function positiveInteger(value, fallback = 1) {
    const number = toInteger(value, fallback);
    return number > 0 ? number : fallback;
  }

  function normalizeRole(role) {
    const normalized = String(role || "").trim().toLowerCase();
    return ["admin", "manager", "lab admin"].includes(normalized) ? "admin" : "user";
  }

  function getBackendUser() {
    const auth = window.BACKEND_AUTH || {};

    if (!auth.isAuthenticated) {
      return null;
    }

    return {
      username: auth.username || "User",
      role: normalizeRole(auth.role),
    };
  }

  function normalizeInventoryItem(item, index = 0) {
    const name = item.name ?? item.item_name ?? item.itemName ?? "Unnamed Item";
    const quantity =
      item.quantity_available ??
      item.quantityAvailable ??
      item.quantity ??
      item.quantity_total ??
      0;
    const checkoutDays =
      item.checkoutDays ??
      item.checkout_days ??
      item.rental_period_days ??
      7;

    return {
      id: String(item.id ?? item.item_id ?? item.inventory_id ?? `item-${index}-${name}`),
      name: String(name),
      category: String(item.category ?? item.item_category ?? "General"),
      condition: String(item.condition ?? item.item_condition ?? "Good"),
      quantity: Math.max(0, toInteger(quantity, 0)),
      description: String(item.description ?? "No description provided."),
      checkoutDays: Math.min(60, positiveInteger(checkoutDays, 7)),
      cableTypes: Array.isArray(item.cableTypes ?? item.cable_types)
        ? item.cableTypes ?? item.cable_types
        : [],
      cableLengths: Array.isArray(item.cableLengths ?? item.cable_lengths)
        ? item.cableLengths ?? item.cable_lengths
        : [],
      chargerTypes: Array.isArray(item.chargerTypes ?? item.charger_types)
        ? item.chargerTypes ?? item.charger_types
        : [],
    };
  }

  function normalizeRequestItem(item, index = 0) {
    const extra = item.extra || {};

    return {
      itemId: String(
        item.itemId ??
          item.item_id ??
          item.inventory_id ??
          `request-item-${index}`
      ),
      itemName: String(item.itemName ?? item.item_name ?? item.name ?? "Unknown Item"),
      quantity: Math.max(
        1,
        positiveInteger(item.quantity ?? item.quantity_requested, 1)
      ),
      checkoutDays: Math.min(
        60,
        positiveInteger(
          item.checkoutDays ??
            item.checkout_days ??
            item.rental_period_days,
          7
        )
      ),
      extra: {
        cableType:
          extra.cableType ??
          item.cableType ??
          item.cable_type ??
          "",
        cableLength:
          extra.cableLength ??
          item.cableLength ??
          item.cable_length ??
          "",
        chargerType:
          extra.chargerType ??
          item.chargerType ??
          item.charger_type ??
          "",
      },
    };
  }

  function normalizeRequest(request, index = 0) {
    return {
      id: String(
        request.id ??
          request.request_id ??
          `request-${Date.now()}-${index}`
      ),
      username: String(
        request.username ??
          request.user_name ??
          request.email ??
          request.student_id ??
          ""
      ),
      status: String(
        request.status ??
          request.request_status ??
          "pending"
      ).toLowerCase(),
      requestDateISO:
        request.requestDateISO ??
        request.request_date ??
        request.created_at ??
        new Date().toISOString(),
      dueDateISO:
        request.dueDateISO ??
        request.due_date ??
        null,
      returnedDateISO:
        request.returnedDateISO ??
        request.returned_date ??
        null,
      items: Array.isArray(request.items ?? request.request_items)
        ? (request.items ?? request.request_items).map(normalizeRequestItem)
        : [],
      belongsToCurrentUser: Boolean(
        request.belongsToCurrentUser ??
          request.belongs_to_current_user
      ),
    };
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (Array.isArray(data.inventory)) {
          inventory = data.inventory.map(normalizeInventoryItem);
        }

        if (Array.isArray(data.rentalRequests)) {
          rentalRequests = data.rentalRequests.map(normalizeRequest);
        }

        if (Array.isArray(data.rentalHistory)) {
          rentalHistory = data.rentalHistory.map(normalizeRequest);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (
      Array.isArray(backendData.inventory) &&
      backendData.inventory.length > 0
    ) {
      inventory = backendData.inventory.map(normalizeInventoryItem);
    }

    if (
      Array.isArray(backendData.pendingRequests) &&
      backendData.pendingRequests.length > 0
    ) {
      rentalRequests = backendData.pendingRequests.map(normalizeRequest);
    }

    if (
      Array.isArray(backendData.rentalHistory) &&
      backendData.rentalHistory.length > 0
    ) {
      rentalHistory = backendData.rentalHistory.map(normalizeRequest);
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

  function setLoginError(message) {
    loginError.textContent = message;
    loginError.classList.toggle("hidden", !message);
  }

  function formatDate(value) {
    if (!value) {
      return "Not set";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDays(days) {
    const number = positiveInteger(days, 1);
    return `${number} ${number === 1 ? "day" : "days"}`;
  }

  function formatQuantity(quantity) {
    const number = positiveInteger(quantity, 1);
    return `${number} ${number === 1 ? "item" : "items"}`;
  }

  function findInventoryItem(identifier) {
    const value = String(identifier || "").toLowerCase();

    return inventory.find(
      (item) =>
        item.id.toLowerCase() === value ||
        item.name.toLowerCase() === value
    );
  }

  function sortInventory() {
    inventory.sort((a, b) => a.name.localeCompare(b.name));
  }

  function getAvailabilityStatus(item) {
    const condition = item.condition.toLowerCase();

    if (item.quantity <= 0 || condition.includes("unavailable")) {
      return {
        label: "Unavailable",
        className: "unavailable",
      };
    }

    if (condition.includes("damaged")) {
      return {
        label: "Damaged",
        className: "damaged",
      };
    }

    if (condition.includes("repair")) {
      return {
        label: "Under Repair",
        className: "low-stock",
      };
    }

    if (item.quantity <= 3) {
      return {
        label: "Low Stock",
        className: "low-stock",
      };
    }

    return {
      label: "Available",
      className: "available",
    };
  }

  function normalizeStatus(status, dueDateISO) {
    if (
      status === "approved" &&
      dueDateISO &&
      new Date(dueDateISO) < new Date()
    ) {
      return "overdue";
    }

    return status || "pending";
  }

  function statusBadge(status, dueDateISO) {
    const normalized = normalizeStatus(status, dueDateISO);
    const label =
      normalized.charAt(0).toUpperCase() +
      normalized.slice(1);

    return `<span class="badge ${escapeHTML(normalized)}">${escapeHTML(label)}</span>`;
  }

  function getExtraDescription(extra) {
    const values = [];

    if (extra?.cableType) {
      values.push(`Type: ${extra.cableType}`);
    }

    if (extra?.cableLength) {
      values.push(`Length: ${extra.cableLength}`);
    }

    if (extra?.chargerType) {
      values.push(`Type: ${extra.chargerType}`);
    }

    return values.length
      ? ` (${values.join(" | ")})`
      : "";
  }

  function renderItemList(items) {
    return `
      <ul class="item-list">
        ${items
          .map(
            (item) =>
              `<li><strong>${escapeHTML(item.quantity)}× ${escapeHTML(item.itemName)}</strong> — ${escapeHTML(formatDays(item.checkoutDays))}${escapeHTML(getExtraDescription(item.extra))}</li>`
          )
          .join("")}
      </ul>
    `;
  }

  function getMaximumCheckoutDays(items) {
    return items.reduce(
      (largest, item) =>
        Math.max(
          largest,
          positiveInteger(item.checkoutDays, 1)
        ),
      1
    );
  }

  function getDueDate(items) {
    const date = new Date();
    date.setDate(
      date.getDate() +
        getMaximumCheckoutDays(items)
    );
    return date.toISOString();
  }

  function getCartQuantityForItem(itemId, excludedKey = "") {
    return cart.reduce((total, entry) => {
      if (
        entry.itemId === itemId &&
        entry.key !== excludedKey
      ) {
        return total + entry.quantity;
      }

      return total;
    }, 0);
  }

  function createCartKey(itemId, extra) {
    return [
      itemId,
      extra.cableType || "",
      extra.cableLength || "",
      extra.chargerType || "",
    ].join("|");
  }

  function updateCartCount() {
    const count = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cartCountSpan.textContent = count;
    requestTotal.textContent = formatQuantity(count);
    submitRentalRequestBtn.disabled = count === 0;
    clearCartBtn.disabled = count === 0;
  }

  function renderInventory() {
    inventoryGrid.innerHTML = "";
    sortInventory();

    inventory.forEach((item) => {
      const status = getAvailabilityStatus(item);
      const card = document.createElement("article");

      card.className = "equipment-card";

      card.innerHTML = `
        <div class="card-top">
          <div>
            <h3 class="item-title">${escapeHTML(item.name)}</h3>
            <p class="item-category">${escapeHTML(item.category)}</p>
          </div>
          <span class="badge ${escapeHTML(status.className)}">${escapeHTML(status.label)}</span>
        </div>

        <p class="record-meta item-description">${escapeHTML(item.description)}</p>

        <div class="detail-list">
          <div><span>Available:</span> ${escapeHTML(item.quantity)}</div>
          <div><span>Condition:</span> ${escapeHTML(item.condition)}</div>
          <div><span>Default Checkout:</span> ${escapeHTML(formatDays(item.checkoutDays))}</div>
        </div>
      `;

      if (currentUser?.role !== "admin") {
        const optionStack = document.createElement("div");
        optionStack.className = "option-stack";

        const quantityLabel = document.createElement("label");
        quantityLabel.textContent = "Quantity requested";

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.max = String(Math.max(1, item.quantity));
        quantityInput.value = "1";
        quantityInput.disabled = item.quantity <= 0;

        quantityLabel.appendChild(quantityInput);
        optionStack.appendChild(quantityLabel);

        const daysLabel = document.createElement("label");
        daysLabel.textContent = "Requested checkout days";

        const daysInput = document.createElement("input");
        daysInput.type = "number";
        daysInput.min = "1";
        daysInput.max = "60";
        daysInput.value = String(item.checkoutDays);
        daysInput.disabled = item.quantity <= 0;

        daysLabel.appendChild(daysInput);
        optionStack.appendChild(daysLabel);

        let cableTypeSelect = null;
        let cableLengthSelect = null;
        let chargerTypeSelect = null;

        if (item.cableTypes.length > 0) {
          const typeLabel = document.createElement("label");
          typeLabel.textContent = "Cable type";

          cableTypeSelect = document.createElement("select");

          item.cableTypes.forEach((value) => {
            cableTypeSelect.add(new Option(value, value));
          });

          typeLabel.appendChild(cableTypeSelect);
          optionStack.appendChild(typeLabel);

          const lengthLabel = document.createElement("label");
          lengthLabel.textContent = "Cable length";

          cableLengthSelect = document.createElement("select");

          const lengths =
            item.cableLengths.length > 0
              ? item.cableLengths
              : ["6ft"];

          lengths.forEach((value) => {
            cableLengthSelect.add(new Option(value, value));
          });

          lengthLabel.appendChild(cableLengthSelect);
          optionStack.appendChild(lengthLabel);
        }

        if (item.chargerTypes.length > 0) {
          const chargerLabel = document.createElement("label");
          chargerLabel.textContent = "Charger type";

          chargerTypeSelect = document.createElement("select");

          item.chargerTypes.forEach((value) => {
            chargerTypeSelect.add(new Option(value, value));
          });

          chargerLabel.appendChild(chargerTypeSelect);
          optionStack.appendChild(chargerLabel);
        }

        card.appendChild(optionStack);

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "primary-btn request-card-btn";
        addButton.textContent = "Add to Request";
        addButton.disabled =
          item.quantity <= 0 ||
          status.className === "damaged";

        addButton.addEventListener("click", () => {
          const quantity = toInteger(
            quantityInput.value,
            0
          );
          const checkoutDays = toInteger(
            daysInput.value,
            0
          );

          if (
            quantity < 1 ||
            quantity > item.quantity
          ) {
            showNotification(
              `Enter a quantity between 1 and ${item.quantity} for ${item.name}.`
            );
            return;
          }

          if (
            checkoutDays < 1 ||
            checkoutDays > 60
          ) {
            showNotification(
              "Checkout days must be between 1 and 60."
            );
            return;
          }

          const extra = {
            cableType: cableTypeSelect?.value || "",
            cableLength: cableLengthSelect?.value || "",
            chargerType: chargerTypeSelect?.value || "",
          };

          const key = createCartKey(item.id, extra);
          const existing = cart.find(
            (entry) => entry.key === key
          );
          const alreadyRequested =
            getCartQuantityForItem(item.id);

          if (
            alreadyRequested + quantity >
            item.quantity
          ) {
            showNotification(
              `Only ${item.quantity} ${item.name} items are available across this request.`
            );
            return;
          }

          if (existing) {
            existing.quantity += quantity;
            existing.checkoutDays = checkoutDays;
          } else {
            cart.push({
              key,
              itemId: item.id,
              itemName: item.name,
              quantity,
              checkoutDays,
              extra,
            });
          }

          updateCartCount();

          showNotification(
            `${quantity} ${item.name}${quantity === 1 ? "" : " items"} added to the request list.`
          );
        });

        actions.appendChild(addButton);
        card.appendChild(actions);
      }

      inventoryGrid.appendChild(card);
    });
  }

  function renderCart() {
    cartItemsDiv.innerHTML = "";

    if (cart.length === 0) {
      cartItemsDiv.innerHTML =
        '<div class="empty-state">Your request list is empty.</div>';

      updateCartCount();
      return;
    }

    cart.forEach((entry) => {
      const inventoryItem =
        findInventoryItem(entry.itemId);
      const card =
        document.createElement("div");

      card.className =
        "record-card request-line";

      const configuration =
        getExtraDescription(entry.extra)
          .replace(/^ \(|\)$/g, "") ||
        "Standard configuration";

      card.innerHTML = `
        <div class="record-header">
          <div>
            <p class="record-title">${escapeHTML(entry.itemName)}</p>
            <p class="record-meta">${escapeHTML(configuration)}</p>
          </div>
          <button class="remove-btn" type="button">Remove</button>
        </div>

        <div class="request-line-fields">
          <label>
            Quantity
            <input class="cart-quantity-input" type="number" min="1" max="${escapeHTML(inventoryItem?.quantity ?? entry.quantity)}" value="${escapeHTML(entry.quantity)}">
          </label>

          <label>
            Checkout Days
            <input class="cart-days-input" type="number" min="1" max="60" value="${escapeHTML(entry.checkoutDays)}">
          </label>
        </div>
      `;

      const quantityInput =
        card.querySelector(".cart-quantity-input");
      const daysInput =
        card.querySelector(".cart-days-input");
      const removeButton =
        card.querySelector(".remove-btn");

      quantityInput.addEventListener("change", () => {
        const value = toInteger(
          quantityInput.value,
          0
        );
        const available =
          inventoryItem?.quantity ??
          entry.quantity;
        const otherQuantity =
          getCartQuantityForItem(
            entry.itemId,
            entry.key
          );

        if (
          value < 1 ||
          value + otherQuantity > available
        ) {
          quantityInput.value =
            String(entry.quantity);

          showNotification(
            `The total requested quantity for ${entry.itemName} cannot exceed ${available}.`
          );
          return;
        }

        entry.quantity = value;
        updateCartCount();
      });

      daysInput.addEventListener("change", () => {
        const value = toInteger(
          daysInput.value,
          0
        );

        if (
          value < 1 ||
          value > 60
        ) {
          daysInput.value =
            String(entry.checkoutDays);

          showNotification(
            "Checkout days must be between 1 and 60."
          );
          return;
        }

        entry.checkoutDays = value;
      });

      removeButton.addEventListener("click", () => {
        cart = cart.filter(
          (item) => item.key !== entry.key
        );

        renderCart();
        updateCartCount();
      });

      cartItemsDiv.appendChild(card);
    });

    updateCartCount();
  }

  function appendHiddenField(name, value) {
    const input =
      document.createElement("input");

    input.type = "hidden";
    input.name = name;
    input.value = String(value ?? "");

    requestHiddenFields.appendChild(input);
  }

  function prepareRequestForm() {
    requestHiddenFields.innerHTML = "";

    const items = cart.map((entry) => ({
      item_id: entry.itemId,
      item_name: entry.itemName,
      quantity_requested: entry.quantity,
      checkout_days: entry.checkoutDays,
      cable_type: entry.extra.cableType || "",
      cable_length: entry.extra.cableLength || "",
      charger_type: entry.extra.chargerType || "",
    }));

    appendHiddenField(
      "request_items",
      JSON.stringify(items)
    );

    appendHiddenField(
      "request_date",
      new Date().toISOString()
    );

    items.forEach((item) => {
      appendHiddenField(
        "item_id",
        item.item_id
      );
      appendHiddenField(
        "item_name",
        item.item_name
      );
      appendHiddenField(
        "quantity_requested",
        item.quantity_requested
      );
      appendHiddenField(
        "checkout_days",
        item.checkout_days
      );
      appendHiddenField(
        "cable_type",
        item.cable_type
      );
      appendHiddenField(
        "cable_length",
        item.cable_length
      );
      appendHiddenField(
        "charger_type",
        item.charger_type
      );
    });
  }

  async function postForm(url, formData) {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    let data = null;
    let text = "";

    const contentType =
      response.headers.get("content-type") || "";

    if (
      contentType.includes("application/json")
    ) {
      data = await response
        .json()
        .catch(() => null);
    } else {
      text = await response
        .text()
        .catch(() => "");
    }

    if (
      response.status === 404 ||
      response.status === 405
    ) {
      return {
        connected: false,
        response,
        data,
        text,
      };
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        "The server could not complete this action.";

      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return {
      connected: true,
      response,
      data,
      text,
    };
  }

  function validateCartAvailability() {
    for (const entry of cart) {
      const item =
        findInventoryItem(entry.itemId);

      if (!item) {
        return `${entry.itemName} is no longer in inventory.`;
      }

      if (
        entry.quantity < 1 ||
        entry.quantity > item.quantity
      ) {
        return `Only ${item.quantity} ${entry.itemName} items are currently available.`;
      }

      if (
        entry.checkoutDays < 1 ||
        entry.checkoutDays > 60
      ) {
        return `The checkout length for ${entry.itemName} must be between 1 and 60 days.`;
      }
    }

    return "";
  }

  async function submitRentalRequest(event) {
    event.preventDefault();

    if (!currentUser) {
      hideModal(cartModal);
      setLoginError(
        "Log in before submitting an equipment request."
      );
      showModal(loginModal);
      return;
    }

    if (currentUser.role !== "user") {
      showNotification(
        "Admin accounts cannot submit borrower requests."
      );
      return;
    }

    if (cart.length === 0) {
      showNotification(
        "Add at least one item before submitting a request."
      );
      return;
    }

    const validationMessage =
      validateCartAvailability();

    if (validationMessage) {
      showNotification(validationMessage);
      return;
    }

    prepareRequestForm();

    submitRentalRequestBtn.disabled = true;
    submitRentalRequestBtn.textContent =
      "Submitting...";

    try {
      const result = await postForm(
        routes.submitRequestUrl ||
          requestForm.action ||
          "/submit-request",
        new FormData(requestForm)
      );

      const requestId = String(
        result.data?.request_id ??
          result.data?.id ??
          Date.now()
      );

      const request = {
        id: requestId,
        username: currentUser.username,
        status: "pending",
        requestDateISO:
          new Date().toISOString(),
        dueDateISO: null,
        returnedDateISO: null,
        items: cart.map((entry) =>
          normalizeRequestItem(entry)
        ),
        belongsToCurrentUser: true,
      };

      if (
        !rentalRequests.some(
          (entry) => entry.id === request.id
        )
      ) {
        rentalRequests.push(request);
      }

      cart = [];

      saveState();
      renderCart();
      renderRequests();
      renderUserPendingRequests();
      hideModal(cartModal);

      showNotification(
        result.connected
          ? `Request #${requestId} was submitted for admin approval.`
          : `Request #${requestId} was saved in the frontend demo. The Flask /submit-request route is not connected yet.`
      );
    } catch (error) {
      if (
        error.status === 401 ||
        error.status === 403
      ) {
        hideModal(cartModal);

        setLoginError(
          "Your session is not authorized to submit this request. Log in again."
        );

        showModal(loginModal);
      } else {
        showNotification(error.message);
      }
    } finally {
      submitRentalRequestBtn.textContent =
        "Submit Request";

      updateCartCount();
    }
  }

  function requestBelongsToCurrentUser(request) {
    if (!currentUser) {
      return false;
    }

    if (
      request.belongsToCurrentUser ||
      !request.username
    ) {
      return true;
    }

    return (
      request.username.toLowerCase() ===
      currentUser.username.toLowerCase()
    );
  }

  function renderUserPendingRequests() {
    if (
      !currentUser ||
      currentUser.role !== "user"
    ) {
      userRequestsSection.classList.add("hidden");
      return;
    }

    userRequestsSection.classList.remove("hidden");
    userPendingList.innerHTML = "";

    const entries = rentalRequests.filter(
      requestBelongsToCurrentUser
    );

    if (entries.length === 0) {
      userPendingList.innerHTML =
        '<div class="empty-state">You have no pending requests.</div>';
      return;
    }

    entries
      .slice()
      .reverse()
      .forEach((request) => {
        const card =
          document.createElement("article");

        card.className = "record-card";

        card.innerHTML = `
          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(request.id)}</p>
              <p class="record-meta">Submitted: ${escapeHTML(formatDate(request.requestDateISO))}</p>
            </div>
            ${statusBadge("pending")}
          </div>

          ${renderItemList(request.items)}
        `;

        userPendingList.appendChild(card);
      });
  }

  function renderRequests() {
    requestsListDiv.innerHTML = "";

    if (rentalRequests.length === 0) {
      requestsListDiv.innerHTML =
        '<div class="empty-state">There are no pending requests.</div>';
      return;
    }

    rentalRequests
      .slice()
      .reverse()
      .forEach((request) => {
        const form =
          document.createElement("form");

        form.className =
          "record-card decision-form";
        form.method = "POST";
        form.action =
          routes.requestDecisionUrl ||
          "/request-decision";

        form.innerHTML = `
          <input type="hidden" name="request_id" value="${escapeHTML(request.id)}">

          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(request.id)}${request.username ? ` — ${escapeHTML(request.username)}` : ""}</p>
              <p class="record-meta">Submitted: ${escapeHTML(formatDate(request.requestDateISO))}</p>
            </div>
            ${statusBadge("pending")}
          </div>

          ${renderItemList(request.items)}

          <div class="record-actions">
            <button class="approve-btn" type="submit" name="decision" value="approve">Approve</button>
            <button class="deny-btn" type="submit" name="decision" value="deny">Deny</button>
          </div>
        `;

        form.addEventListener(
          "submit",
          handleRequestDecision
        );

        requestsListDiv.appendChild(form);
      });
  }

  function canApproveRequest(request) {
    for (const requestItem of request.items) {
      const inventoryItem =
        findInventoryItem(requestItem.itemId) ||
        findInventoryItem(requestItem.itemName);

      if (
        !inventoryItem ||
        inventoryItem.quantity <
          requestItem.quantity
      ) {
        return false;
      }
    }

    return true;
  }

  function moveRequestToHistory(
    request,
    decision
  ) {
    rentalRequests = rentalRequests.filter(
      (entry) => entry.id !== request.id
    );

    request.status =
      decision === "approve"
        ? "approved"
        : "denied";

    request.dueDateISO =
      decision === "approve"
        ? getDueDate(request.items)
        : null;

    if (decision === "approve") {
      request.items.forEach((requestItem) => {
        const inventoryItem =
          findInventoryItem(
            requestItem.itemId
          ) ||
          findInventoryItem(
            requestItem.itemName
          );

        if (inventoryItem) {
          inventoryItem.quantity =
            Math.max(
              0,
              inventoryItem.quantity -
                requestItem.quantity
            );
        }
      });
    }

    const existingIndex =
      rentalHistory.findIndex(
        (entry) => entry.id === request.id
      );

    if (existingIndex >= 0) {
      rentalHistory[existingIndex] =
        request;
    } else {
      rentalHistory.push(request);
    }
  }

  async function handleRequestDecision(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitter = event.submitter;
    const requestId =
      form.elements.request_id.value;
    const decision = submitter?.value;

    const request = rentalRequests.find(
      (entry) => entry.id === requestId
    );

    if (
      !request ||
      !["approve", "deny"].includes(decision)
    ) {
      showNotification(
        "The selected request could not be found."
      );
      return;
    }

    if (
      decision === "approve" &&
      !canApproveRequest(request)
    ) {
      showNotification(
        "This request cannot be approved because one or more items do not have enough available quantity."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "request_id",
      requestId
    );
    formData.append(
      "decision",
      decision
    );

    form
      .querySelectorAll("button")
      .forEach((button) => {
        button.disabled = true;
      });

    try {
      const result = await postForm(
        form.action,
        formData
      );

      moveRequestToHistory(
        request,
        decision
      );

      saveState();
      renderAll();

      showNotification(
        result.connected
          ? `Request #${requestId} was ${decision === "approve" ? "approved" : "denied"}.`
          : `Request #${requestId} was ${decision === "approve" ? "approved" : "denied"} in the frontend demo. The Flask decision route is not connected yet.`
      );
    } catch (error) {
      showNotification(error.message);

      form
        .querySelectorAll("button")
        .forEach((button) => {
          button.disabled = false;
        });
    }
  }

  function renderRentalHistory() {
    rentalHistoryListDiv.innerHTML = "";

    if (rentalHistory.length === 0) {
      rentalHistoryListDiv.innerHTML =
        '<div class="empty-state">No rental history is available.</div>';
      return;
    }

    rentalHistory
      .slice()
      .reverse()
      .forEach((entry) => {
        const normalizedStatus =
          normalizeStatus(
            entry.status,
            entry.dueDateISO
          );

        const card =
          document.createElement("article");

        card.className = "record-card";

        card.innerHTML = `
          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(entry.id)}${entry.username ? ` — ${escapeHTML(entry.username)}` : ""}</p>
              <p class="record-meta">Requested: ${escapeHTML(formatDate(entry.requestDateISO))}</p>
              <p class="record-meta">Due: ${entry.dueDateISO ? escapeHTML(formatDate(entry.dueDateISO)) : "Not assigned"}</p>
              ${entry.returnedDateISO ? `<p class="record-meta">Returned: ${escapeHTML(formatDate(entry.returnedDateISO))}</p>` : ""}
            </div>
            ${statusBadge(entry.status, entry.dueDateISO)}
          </div>

          ${renderItemList(entry.items)}
        `;

        if (
          ["approved", "overdue"].includes(
            normalizedStatus
          )
        ) {
          const form =
            document.createElement("form");

          form.className =
            "record-actions return-form";
          form.method = "POST";
          form.action =
            routes.processReturnUrl ||
            "/process-return";

          form.innerHTML = `
            <input type="hidden" name="request_id" value="${escapeHTML(entry.id)}">
            <button class="return-btn" type="submit">Process Return</button>
          `;

          form.addEventListener(
            "submit",
            handleReturn
          );

          card.appendChild(form);
        }

        rentalHistoryListDiv.appendChild(card);
      });
  }

  async function handleReturn(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const requestId =
      form.elements.request_id.value;

    const entry = rentalHistory.find(
      (request) => request.id === requestId
    );

    if (!entry) {
      showNotification(
        "The selected checkout record could not be found."
      );
      return;
    }

    const button =
      form.querySelector("button");

    button.disabled = true;

    const formData =
      new FormData(form);

    try {
      const result = await postForm(
        form.action,
        formData
      );

      entry.items.forEach((requestItem) => {
        const inventoryItem =
          findInventoryItem(
            requestItem.itemId
          ) ||
          findInventoryItem(
            requestItem.itemName
          );

        if (inventoryItem) {
          inventoryItem.quantity +=
            requestItem.quantity;
        }
      });

      entry.status = "returned";
      entry.returnedDateISO =
        new Date().toISOString();

      saveState();
      renderAll();

      showNotification(
        result.connected
          ? `Request #${requestId} was processed as returned.`
          : `Request #${requestId} was returned in the frontend demo. The Flask return route is not connected yet.`
      );
    } catch (error) {
      showNotification(error.message);
      button.disabled = false;
    }
  }

  function renderUserRentals() {
    if (
      !currentUser ||
      currentUser.role !== "user"
    ) {
      userRentalsSection.classList.add("hidden");
      return;
    }

    userRentalsSection.classList.remove("hidden");
    userRentalsList.innerHTML = "";

    const entries = rentalHistory.filter(
      requestBelongsToCurrentUser
    );

    if (entries.length === 0) {
      userRentalsList.innerHTML =
        '<div class="empty-state">You have no checkout history yet.</div>';
      return;
    }

    entries
      .slice()
      .reverse()
      .forEach((entry) => {
        const card =
          document.createElement("article");

        card.className = "record-card";

        card.innerHTML = `
          <div class="record-header">
            <div>
              <p class="record-title">Request #${escapeHTML(entry.id)}</p>
              <p class="record-meta">Requested: ${escapeHTML(formatDate(entry.requestDateISO))}</p>
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

  function syncAuthUI() {
    currentUser = getBackendUser();

    if (!currentUser) {
      userRoleLabel.textContent =
        "Not logged in";

      loginBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      cartBtn.classList.remove("hidden");
      adminSection.classList.add("hidden");
      userRequestsSection.classList.add("hidden");
      userRentalsSection.classList.add("hidden");
      return;
    }

    userRoleLabel.textContent =
      `Logged in as ${currentUser.username} (${currentUser.role})`;

    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");

    if (currentUser.role === "admin") {
      adminSection.classList.remove("hidden");
      userRequestsSection.classList.add("hidden");
      userRentalsSection.classList.add("hidden");
      cartBtn.classList.add("hidden");
      refreshAdminSelectors();
    } else {
      adminSection.classList.add("hidden");
      userRequestsSection.classList.remove("hidden");
      userRentalsSection.classList.remove("hidden");
      cartBtn.classList.remove("hidden");
    }
  }

  function extractFlashMessage(html) {
    if (!html) {
      return "";
    }

    const documentCopy =
      new DOMParser().parseFromString(
        html,
        "text/html"
      );

    return (
      documentCopy
        .querySelector(
          ".flash-message.error, .flash-message"
        )
        ?.textContent?.trim() || ""
    );
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    setLoginError("");

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent =
      "Logging In...";

    try {
      const response = await fetch(
        loginForm.action,
        {
          method: "POST",
          body: new FormData(loginForm),
          credentials: "same-origin",
          headers: {
            "X-Requested-With":
              "XMLHttpRequest",
          },
        }
      );

      const html = await response.text();

      if (
        response.ok &&
        response.redirected
      ) {
        window.location.assign(
          response.url || "/"
        );
        return;
      }

      const serverMessage =
        extractFlashMessage(html);

      if (!response.ok) {
        setLoginError(
          serverMessage ||
            "That account was not found or the login information is incorrect."
        );
        return;
      }

      setLoginError(
        serverMessage ||
          "The username, password, or selected role is incorrect."
      );
    } catch {
      setLoginError(
        "The login request could not reach the server."
      );
    } finally {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent =
        "Log In";
    }
  }

  function getLogoutUrl() {
    const auth =
      window.BACKEND_AUTH || {};

    if (
      auth.logoutUrl &&
      auth.logoutUrl !== "/" &&
      auth.logoutUrl !== auth.loginUrl
    ) {
      return auth.logoutUrl;
    }

    return routes.logoutUrl || "/logout";
  }

  async function handleLogout() {
    logoutBtn.disabled = true;
    logoutBtn.textContent =
      "Logging Out...";

    const logoutUrl = getLogoutUrl();

    try {
      let response = await fetch(
        logoutUrl,
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "X-Requested-With":
              "XMLHttpRequest",
          },
        }
      );

      if (response.status === 405) {
        response = await fetch(
          logoutUrl,
          {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "X-Requested-With":
                "XMLHttpRequest",
            },
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "The Flask /logout route is not available yet."
        );
      }

      window.location.assign(
        response.redirected
          ? response.url
          : "/"
      );
    } catch (error) {
      showNotification(
        error.message ||
          "Logout could not be completed."
      );

      logoutBtn.disabled = false;
      logoutBtn.textContent = "Logout";
    }
  }

  function getItemFormData(mode) {
    const prefix =
      mode === "add" ? "add" : "update";

    const fields = {
      name: document
        .getElementById(`${prefix}-item-name`)
        .value.trim(),
      category: document
        .getElementById(`${prefix}-item-category`)
        .value.trim(),
      condition: document.getElementById(
        `${prefix}-item-condition`
      ).value,
      quantity: toInteger(
        document.getElementById(
          `${prefix}-item-qty`
        ).value,
        -1
      ),
      description: document
        .getElementById(
          `${prefix}-item-description`
        )
        .value.trim(),
      checkoutDays: toInteger(
        document.getElementById(
          `${prefix}-item-checkout-days`
        ).value,
        0
      ),
    };

    if (
      !fields.name ||
      !fields.category ||
      !fields.description
    ) {
      showNotification(
        "Fill out the item name, category, and description."
      );
      return null;
    }

    if (fields.quantity < 0) {
      showNotification(
        "Enter a quantity of 0 or higher."
      );
      return null;
    }

    if (
      fields.checkoutDays < 1 ||
      fields.checkoutDays > 60
    ) {
      showNotification(
        "Default checkout days must be between 1 and 60."
      );
      return null;
    }

    return fields;
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
    const fields =
      getItemFormData("add");

    if (!fields) {
      return;
    }

    if (findInventoryItem(fields.name)) {
      showNotification(
        `${fields.name} already exists. Use Update Item instead.`
      );
      return;
    }

    inventory.push(
      normalizeInventoryItem({
        id: `local-${Date.now()}`,
        ...fields,
      })
    );

    sortInventory();
    clearAddItemForm();
    saveState();
    refreshAdminSelectors(fields.name);
    renderInventory();

    showNotification(
      `${fields.name} was added to inventory.`
    );
  }

  function populateItemSelect(
    selectElement,
    placeholder
  ) {
    const selected = selectElement.value;

    selectElement.innerHTML = "";
    selectElement.add(
      new Option(placeholder, "")
    );

    inventory.forEach((item) => {
      selectElement.add(
        new Option(item.name, item.id)
      );
    });

    if (
      inventory.some(
        (item) => item.id === selected
      )
    ) {
      selectElement.value = selected;
    }
  }

  function refreshAdminSelectors(
    preferredName = ""
  ) {
    sortInventory();

    populateItemSelect(
      updateItemSelect,
      "Select an item to edit"
    );

    populateItemSelect(
      deleteItemNameInput,
      "Select an item to delete"
    );

    populateItemSelect(
      damageItemNameInput,
      "Select an item to damage out"
    );

    const preferred = inventory.find(
      (item) => item.name === preferredName
    );

    if (preferred) {
      updateItemSelect.value = preferred.id;
    }

    populateUpdateForm();
  }

  function setUpdateFieldsDisabled(disabled) {
    [
      updateItemNameInput,
      updateItemCategoryInput,
      updateItemConditionSelect,
      updateItemQtyInput,
      updateItemDescriptionInput,
      updateItemCheckoutDaysInput,
      updateItemBtn,
      resetUpdateItemBtn,
    ].forEach((element) => {
      element.disabled = disabled;
    });
  }

  function populateUpdateForm() {
    const item = findInventoryItem(
      updateItemSelect.value
    );

    if (!item) {
      updateItemNameInput.value = "";
      updateItemCategoryInput.value = "";
      updateItemConditionSelect.value = "Good";
      updateItemQtyInput.value = "";
      updateItemDescriptionInput.value = "";
      updateItemCheckoutDaysInput.value = "";

      setUpdateFieldsDisabled(true);
      return;
    }

    updateItemNameInput.value = item.name;
    updateItemCategoryInput.value =
      item.category;
    updateItemConditionSelect.value =
      item.condition;
    updateItemQtyInput.value =
      String(item.quantity);
    updateItemDescriptionInput.value =
      item.description;
    updateItemCheckoutDaysInput.value =
      String(item.checkoutDays);

    setUpdateFieldsDisabled(false);
  }

  function updateItem() {
    const item = findInventoryItem(
      updateItemSelect.value
    );

    const fields =
      getItemFormData("update");

    if (!item || !fields) {
      if (!item) {
        showNotification(
          "Select an item to update."
        );
      }

      return;
    }

    const duplicate = inventory.find(
      (entry) =>
        entry.id !== item.id &&
        entry.name.toLowerCase() ===
          fields.name.toLowerCase()
    );

    if (duplicate) {
      showNotification(
        `Another item named ${fields.name} already exists.`
      );
      return;
    }

    Object.assign(item, fields);

    cart.forEach((entry) => {
      if (entry.itemId === item.id) {
        entry.itemName = fields.name;
      }
    });

    saveState();
    refreshAdminSelectors(fields.name);
    renderAll();

    showNotification(
      `${fields.name} was updated.`
    );
  }

  function deleteItem() {
    const item = findInventoryItem(
      deleteItemNameInput.value
    );

    if (!item) {
      showNotification(
        "Select an item to delete."
      );
      return;
    }

    const activeCheckout =
      rentalHistory.some(
        (entry) =>
          ["approved", "overdue"].includes(
            normalizeStatus(
              entry.status,
              entry.dueDateISO
            )
          ) &&
          entry.items.some(
            (requestItem) =>
              requestItem.itemId === item.id ||
              requestItem.itemName.toLowerCase() ===
                item.name.toLowerCase()
          )
      );

    if (activeCheckout) {
      showNotification(
        `${item.name} cannot be deleted while it is part of an active checkout.`
      );
      return;
    }

    inventory = inventory.filter(
      (entry) => entry.id !== item.id
    );

    cart = cart.filter(
      (entry) => entry.itemId !== item.id
    );

    saveState();
    refreshAdminSelectors();
    renderAll();

    showNotification(
      `${item.name} was deleted from the catalog.`
    );
  }

  function damageItem() {
    const item = findInventoryItem(
      damageItemNameInput.value
    );

    const serialNumber =
      damageSerialInput.value.trim();

    const itemNumber =
      damageItemNumberInput.value.trim();

    if (
      !item ||
      !serialNumber ||
      !itemNumber
    ) {
      showNotification(
        "Select an item and fill out both damage identifiers."
      );
      return;
    }

    if (item.quantity <= 0) {
      showNotification(
        `${item.name} has no available quantity to damage out.`
      );
      return;
    }

    item.quantity -= 1;

    if (item.quantity === 0) {
      item.condition =
        "Damaged / Unavailable";
    }

    damageSerialInput.value = "";
    damageItemNumberInput.value = "";

    saveState();
    refreshAdminSelectors(item.name);
    renderInventory();

    showNotification(
      `${item.name}, serial ${serialNumber}, item ${itemNumber}, was damaged out.`
    );
  }

  function renderAll() {
    updateCartCount();
    syncAuthUI();
    renderInventory();
    renderCart();
    renderRequests();
    renderRentalHistory();
    renderUserPendingRequests();
    renderUserRentals();
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((entry) => {
        entry.classList.remove("active");
      });

      tabContents.forEach((entry) => {
        entry.classList.remove("active");
      });

      button.classList.add("active");

      document
        .getElementById(button.dataset.tab)
        .classList.add("active");

      if (
        [
          "update-item-tab",
          "modify-items-tab",
        ].includes(button.dataset.tab)
      ) {
        refreshAdminSelectors();
      }
    });
  });

  loginBtn.addEventListener("click", () => {
    setLoginError("");
    showModal(loginModal);
  });

  loginForm.addEventListener(
    "submit",
    handleLoginSubmit
  );

  loginCancelBtn.addEventListener(
    "click",
    () => hideModal(loginModal)
  );

  logoutBtn.addEventListener(
    "click",
    handleLogout
  );

  cartBtn.addEventListener("click", () => {
    renderCart();
    showModal(cartModal);
  });

  cartCloseBtn.addEventListener(
    "click",
    () => hideModal(cartModal)
  );

  requestForm.addEventListener(
    "submit",
    submitRentalRequest
  );

  clearCartBtn.addEventListener(
    "click",
    () => {
      cart = [];
      renderCart();
      updateCartCount();
    }
  );

  notificationCloseBtn.addEventListener(
    "click",
    () => hideModal(notificationModal)
  );

  [
    loginModal,
    cartModal,
    notificationModal,
  ].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        hideModal(modal);
      }
    });
  });

  addItemBtn.addEventListener(
    "click",
    addItem
  );

  clearAddItemBtn.addEventListener(
    "click",
    clearAddItemForm
  );

  updateItemSelect.addEventListener(
    "change",
    populateUpdateForm
  );

  updateItemBtn.addEventListener(
    "click",
    updateItem
  );

  resetUpdateItemBtn.addEventListener(
    "click",
    populateUpdateForm
  );

  deleteItemBtn.addEventListener(
    "click",
    deleteItem
  );

  damageItemBtn.addEventListener(
    "click",
    damageItem
  );

  loadState();
  sortInventory();
  renderAll();
});