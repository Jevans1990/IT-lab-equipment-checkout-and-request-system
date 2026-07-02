document.addEventListener("DOMContentLoaded", () => {

  // Temporary front-end-only password store (replace with backend later)
  const mockPasswords = {
    user: "user123",
    admin: "admin123"
  };

  let currentUser = null;
  let cart = [];
  let rentalRequests = [];
  let rentalHistory = [];

  let inventory = [
    {
      name: "Laptop",
      quantity: 10,
      rentalOptions: [
        { period: "Day", price: "$20" },
        { period: "Weekend", price: "$50" },
        { period: "Week", price: "$90" }
      ]
    },
    {
      name: "Keyboard",
      quantity: 15,
      rentalOptions: [
        { period: "Day", price: "$5" },
        { period: "Weekend", price: "$12" },
        { period: "Week", price: "$20" }
      ]
    },
    {
      name: "Mouse",
      quantity: 20,
      rentalOptions: [
        { period: "Day", price: "$4" },
        { period: "Weekend", price: "$10" },
        { period: "Week", price: "$18" }
      ]
    },
    {
      name: "Cable",
      quantity: 40,
      rentalOptions: [
        { period: "Day", price: "$2" },
        { period: "Weekend", price: "$5" },
        { period: "Week", price: "$8" }
      ],
      cableTypes: ["USB-A to USB-C", "USB-C to USB-C", "Micro USB", "Mini USB"],
      cableLengths: ["4ft", "6ft", "8ft", "10ft"]
    },
    {
      name: "Wall Charger",
      quantity: 25,
      rentalOptions: [
        { period: "Day", price: "$3" },
        { period: "Weekend", price: "$7" },
        { period: "Week", price: "$12" }
      ],
      chargerTypes: ["USB-A", "USB-C", "USB-C Fast Charging"]
    },
    {
      name: "Car Charger",
      quantity: 18,
      rentalOptions: [
        { period: "Day", price: "$3" },
        { period: "Weekend", price: "$7" },
        { period: "Week", price: "$12" }
      ],
      chargerTypes: ["USB-A", "USB-C"]
    }
  ];

  // DOM elements
  const inventoryGrid = document.getElementById("inventory-grid");
  const adminSection = document.getElementById("admin-section");
  const userRoleLabel = document.getElementById("user-role-label");

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const cartBtn = document.getElementById("cart-btn");
  const cartCountSpan = document.getElementById("cart-count");

  const loginModal = document.getElementById("login-modal");
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginRoleSelect = document.getElementById("login-role");
  const loginSubmitBtn = document.getElementById("login-submit");
  const loginCancelBtn = document.getElementById("login-cancel");

  loginModal.classList.add("hidden");

  const cartModal = document.getElementById("cart-modal");
  const cartItemsDiv = document.getElementById("cart-items");
  const cartCloseBtn = document.getElementById("cart-close");
  const submitRentalRequestBtn = document.getElementById("submit-rental-request");

  const notificationModal = document.getElementById("notification-modal");
  const notificationText = document.getElementById("notification-text");
  const notificationCloseBtn = document.getElementById("notification-close");

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const requestsListDiv = document.getElementById("requests-list");
  const rentalHistoryListDiv = document.getElementById("rental-history-list");

  // Admin modify controls
  const addItemNameInput = document.getElementById("add-item-name");
  const addItemQtyInput = document.getElementById("add-item-qty");
  const addItemBtn = document.getElementById("add-item-btn");

  const deleteItemNameInput = document.getElementById("delete-item-name");
  const deleteItemBtn = document.getElementById("delete-item-btn");

  const damageItemNameInput = document.getElementById("damage-item-name");
  const damageSerialInput = document.getElementById("damage-serial-number");
  const damageItemNumberInput = document.getElementById("damage-item-number");
  const damageItemBtn = document.getElementById("damage-item-btn");

  // Utility: show/hide modals
  function showModal(modal) {
    modal.classList.remove("hidden");
  }
  function hideModal(modal) {
    modal.classList.add("hidden");
  }

  // Render inventory cards
  function renderInventory() {
    inventoryGrid.innerHTML = "";

    inventory.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      const header = document.createElement("div");
      header.className = "card-header";
      header.textContent = item.name;
      card.appendChild(header);

      const body = document.createElement("div");
      body.className = "card-body";

      if (!currentUser || currentUser.role === "user") {
        const rentalLabel = document.createElement("label");
        rentalLabel.textContent = "Rental Period & Price:";
        const rentalSelect = document.createElement("select");
        item.rentalOptions.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt.period;
          option.textContent = `${opt.period} - ${opt.price}`;
          rentalSelect.appendChild(option);
        });
        rentalLabel.appendChild(rentalSelect);
        body.appendChild(rentalLabel);

        if (item.name === "Cable") {
          const typeLabel = document.createElement("label");
          typeLabel.textContent = "Cable Type:";
          const typeSelect = document.createElement("select");
          item.cableTypes.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
          });
          typeLabel.appendChild(typeSelect);
          body.appendChild(typeLabel);

          const lengthLabel = document.createElement("label");
          lengthLabel.textContent = "Cable Length:";
          const lengthSelect = document.createElement("select");
          item.cableLengths.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l;
            opt.textContent = l;
            lengthSelect.appendChild(opt);
          });
          lengthLabel.appendChild(lengthSelect);
          body.appendChild(lengthLabel);
        }

        if (item.chargerTypes) {
          const typeLabel = document.createElement("label");
          typeLabel.textContent = "Charger Type:";
          const typeSelect = document.createElement("select");
          item.chargerTypes.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
          });
          typeLabel.appendChild(typeSelect);
          body.appendChild(typeLabel);
        }

        card.appendChild(body);

        const footer = document.createElement("div");
        footer.className = "card-footer";
        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to Cart";
        addBtn.addEventListener("click", () => {
          const rentalPeriod = rentalSelect.value;
          const extra = {};

          const selects = body.querySelectorAll("select");
          if (item.name === "Cable") {
            extra.cableType = selects[1].value;
            extra.cableLength = selects[2].value;
          }
          if (item.chargerTypes) {
            extra.chargerType = selects[1].value;
          }

          cart.push({
            itemName: item.name,
            rentalPeriod,
            extra
          });
          updateCartCount();
        });
        footer.appendChild(addBtn);
        card.appendChild(footer);

      } else {
        const qtyLabel = document.createElement("label");
        qtyLabel.textContent = `Quantity: ${item.quantity}`;
        body.appendChild(qtyLabel);

        const rentalLabel = document.createElement("label");
        rentalLabel.textContent = "Rental Periods & Pricing:";
        const list = document.createElement("ul");
        item.rentalOptions.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = `${opt.period} - ${opt.price}`;
          list.appendChild(li);
        });
        rentalLabel.appendChild(list);
        body.appendChild(rentalLabel);

        card.appendChild(body);
      }

      inventoryGrid.appendChild(card);
    });
  }

  function updateCartCount() {
    cartCountSpan.textContent = cart.length;
  }

  function renderCart() {
    cartItemsDiv.innerHTML = "";
    if (cart.length === 0) {
      cartItemsDiv.textContent = "Your cart is empty.";
      return;
    }

    cart.forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-card";
      div.textContent = `${item.itemName} - ${item.rentalPeriod}`;
      if (item.extra.cableType) {
        div.textContent += ` | Type: ${item.extra.cableType} | Length: ${item.extra.cableLength}`;
      }
      if (item.extra.chargerType) {
        div.textContent += ` | Type: ${item.extra.chargerType}`;
      }
      cartItemsDiv.appendChild(div);
    });
  }

  function submitRentalRequest() {
    if (!currentUser || currentUser.role !== "user") {
      showNotification("You must be logged in as a user to submit a rental request.");
      return;
    }
    if (cart.length === 0) {
      showNotification("Your cart is empty.");
      return;
    }

    const request = {
      id: Date.now(),
      username: currentUser.username,
      items: [...cart],
      status: "pending"
    };
    rentalRequests.push(request);
    cart = [];
    updateCartCount();
    renderCart();
    showNotification("Your rental request has been submitted and is pending admin approval.");
    renderRequests();
  }

  function renderRequests() {
    requestsListDiv.innerHTML = "";
    if (rentalRequests.length === 0) {
      requestsListDiv.textContent = "No rental requests.";
      return;
    }

    rentalRequests.forEach(req => {
      const card = document.createElement("div");
      card.className = "request-card";

      const header = document.createElement("div");
      header.textContent = `Request #${req.id} from ${req.username} - Status: ${req.status}`;
      card.appendChild(header);

      const itemsList = document.createElement("ul");
      req.items.forEach(it => {
        const li = document.createElement("li");
        let text = `${it.itemName} - ${it.rentalPeriod}`;
        if (it.extra.cableType) {
          text += ` | Type: ${it.extra.cableType} | Length: ${it.extra.cableLength}`;
        }
        if (it.extra.chargerType) {
          text += ` | Type: ${it.extra.chargerType}`;
        }
        li.textContent = text;
        itemsList.appendChild(li);
      });
      card.appendChild(itemsList);

      if (req.status === "pending") {
        const actions = document.createElement("div");
        actions.className = "request-actions";

        const approveBtn = document.createElement("button");
        approveBtn.className = "approve-btn";
        approveBtn.textContent = "Approve";
        approveBtn.addEventListener("click", () => approveRequest(req.id));

        const denyBtn = document.createElement("button");
        denyBtn.className = "deny-btn";
        denyBtn.textContent = "Deny";
        denyBtn.addEventListener("click", () => denyRequest(req.id));

        actions.appendChild(approveBtn);
        actions.appendChild(denyBtn);
        card.appendChild(actions);
      }

      requestsListDiv.appendChild(card);
    });
  }

  function approveRequest(id) {
  const req = rentalRequests.find(r => r.id === id);
  if (!req) return;

  req.status = "approved";

  // Assign due date (3 days from now)
  const due = new Date();
  due.setDate(due.getDate() + 3);
  req.dueDate = due.toLocaleString();

  rentalHistory.push({
    id: req.id,
    username: req.username,
    items: req.items,
    status: "approved",
    date: new Date().toLocaleString(),
    dueDate: req.dueDate
  });

  renderRequests();
  renderRentalHistory();
  renderUserRentals();
  showNotification(`Request #${id} approved. Items are due on ${req.dueDate}.`);
}

  function denyRequest(id) {
    const req = rentalRequests.find(r => r.id === id);
    if (!req) return;
    req.status = "denied";
    rentalHistory.push({
      id: req.id,
      username: req.username,
      items: req.items,
      status: "denied",
      date: new Date().toLocaleString()
    });
    renderRequests();
    renderRentalHistory();
    showNotification(`Request #${id} has been denied.`);
  }

  function markReturned(id) {
  const entry = rentalHistory.find(r => r.id === id);
  if (!entry) return;

  // Add items back to inventory
  entry.items.forEach(it => {
    const invItem = inventory.find(i => i.name === it.itemName);
    if (invItem) {
      invItem.quantity += 1;
    }
  });

  // Update status + due date
  entry.status = "returned";
  entry.dueDate = "Returned";
  entry.date = new Date().toLocaleString();

  renderInventory();
  renderRentalHistory();
  renderUserRentals();
  showNotification(`Request #${id} marked as returned.`);
}

  function renderRentalHistory() {
  rentalHistoryListDiv.innerHTML = "";
  if (rentalHistory.length === 0) {
    rentalHistoryListDiv.textContent = "No rental history yet.";
    return;
  }

  rentalHistory.forEach(entry => {
    const card = document.createElement("div");
    card.className = "history-card";
    card.textContent = `Request #${entry.id} - ${entry.username} - ${entry.status} - ${entry.date}`;

    // Add RETURN button only if approved and not yet returned
    if (entry.status === "approved") {
      const returnBtn = document.createElement("button");
      returnBtn.textContent = "Returned";
      returnBtn.className = "return-btn";
      returnBtn.addEventListener("click", () => markReturned(entry.id));
      card.appendChild(returnBtn);
    }

    rentalHistoryListDiv.appendChild(card);
  });
}

function renderUserRentals() {
  if (!currentUser || currentUser.role !== "user") {
    document.getElementById("user-rentals-section").classList.add("hidden");
    return;
  }

  const section = document.getElementById("user-rentals-section");
  const list = document.getElementById("user-rentals-list");

  section.classList.remove("hidden");
  list.innerHTML = "";

  const userEntries = rentalHistory.filter(h => h.username === currentUser.username);

  if (userEntries.length === 0) {
    list.textContent = "You have no rentals.";
    return;
  }

  userEntries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "user-rental-card";

    card.textContent = `Request #${entry.id} - Status: ${entry.status}`;

    const due = document.createElement("div");
    due.textContent = `Due Date: ${entry.dueDate || "Returned"}`;
    card.appendChild(due);

    const itemsList = document.createElement("ul");
    entry.items.forEach(it => {
      const li = document.createElement("li");
      li.textContent = `${it.itemName} (${it.rentalPeriod})`;
      itemsList.appendChild(li);
    });
    card.appendChild(itemsList);

    list.appendChild(card);
  });
}

  function showNotification(message) {
    notificationText.textContent = message;
    showModal(notificationModal);
  }

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      tabContents.forEach(tc => {
        if (tc.id === target) {
          tc.classList.add("active");
        } else {
          tc.classList.remove("active");
        }
      });
    });
  });

  // LOGIN WITH ROLE LOCK + PASSWORD
  loginSubmitBtn.addEventListener("click", () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    const role = loginRoleSelect.value;

    if (!username || !password) {
      showNotification("Please enter both username and password.");
      return;
    }

    // Enforce correct username → role pairing
    if (role === "admin" && username.toLowerCase() !== "admin") {
      showNotification("Only the admin account may log in as admin.");
      return;
    }

    if (role === "user" && username.toLowerCase() === "admin") {
      showNotification("Admin cannot log in as a user.");
      return;
    }

    // Password check
    if (password !== mockPasswords[role]) {
      showNotification("Incorrect password for selected role.");
      return;
    }

    // Successful login
    currentUser = { username, role };
    userRoleLabel.textContent = `Logged in as ${username} (${role})`;

    logoutBtn.classList.remove("hidden");
    loginBtn.classList.add("hidden");

    hideModal(loginModal);

    if (role === "admin") {
      adminSection.classList.remove("hidden");
      renderRequests();
      renderRentalHistory();
    } else {
      adminSection.classList.add("hidden");
    }

    renderInventory();
    renderUserRentals();
  });

  // LOGOUT
  logoutBtn.addEventListener("click", () => {
    currentUser = null;
    cart = [];
    updateCartCount();

    userRoleLabel.textContent = "Not logged in";

    adminSection.classList.add("hidden");

    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");

    showNotification("You have been logged out.");

    renderInventory();
    renderUserRentals();
  });

  loginBtn.addEventListener("click", () => showModal(loginModal));
  loginCancelBtn.addEventListener("click", () => hideModal(loginModal));

  cartBtn.addEventListener("click", () => {
    renderCart();
    showModal(cartModal);
  });

  cartCloseBtn.addEventListener("click", () => hideModal(cartModal));
  submitRentalRequestBtn.addEventListener("click", submitRentalRequest);

  notificationCloseBtn.addEventListener("click", () => hideModal(notificationModal));

  addItemBtn.addEventListener("click", () => {
    const name = addItemNameInput.value.trim();
    const qty = parseInt(addItemQtyInput.value, 10);

    if (!name || isNaN(qty) || qty <= 0) {
      showNotification("Please enter a valid item name and quantity.");
      return;
    }

    const existing = inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.quantity += qty;
    } else {
      inventory.push({
        name,
        quantity: qty,
        rentalOptions: [
          { period: "day", price: "$5" },
          { period: "weekend", price: "$12" },
          { period: "week", price: "$20" }
        ]
      });
    }

    addItemNameInput.value = "";
    addItemQtyInput.value = "";
    renderInventory();
    showNotification(`Item "${name}" updated/added.`);
  });

  deleteItemBtn.addEventListener("click", () => {
    const name = deleteItemNameInput.value.trim();
    if (!name) {
      showNotification("Please enter an item name to delete.");
      return;
    }

    inventory = inventory.filter(i => i.name.toLowerCase() !== name.toLowerCase());
    deleteItemNameInput.value = "";
    renderInventory();
    showNotification(`All of item "${name}" have been deleted.`);
  });

  damageItemBtn.addEventListener("click", () => {
    const name = damageItemNameInput.value.trim();
    const serial = damageSerialInput.value.trim();
    const itemNum = damageItemNumberInput.value.trim();

    if (!name || !serial || !itemNum) {
      showNotification("Please fill out all damage-out fields.");
      return;
    }

    const item = inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (item && item.quantity > 0) {
      item.quantity -= 1;
    }

    damageItemNameInput.value = "";
    damageSerialInput.value = "";
    damageItemNumberInput.value = "";
    showNotification(`Item "${name}" with serial ${serial} and item number ${itemNum} has been damaged out.`);
  });

  renderInventory();

});
