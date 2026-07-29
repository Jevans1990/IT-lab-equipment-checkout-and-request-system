document.addEventListener("DOMContentLoaded", () => {
  const auth = window.BACKEND_AUTH || {};
  const routes = window.BACKEND_ROUTES || {};
  const backendData = window.BACKEND_DATA || {};

  let inventory = Array.isArray(backendData.inventory)
    ? backendData.inventory.map(normalizeInventoryItem)
    : [];

  let pendingRequests = Array.isArray(
    backendData.pendingRequests
  )
    ? backendData.pendingRequests.map(normalizeRequest)
    : [];

  let rentalHistory = Array.isArray(
    backendData.rentalHistory
  )
    ? backendData.rentalHistory.map(normalizeRequest)
    : [];

  let cart = [];

  const currentUser = auth.isAuthenticated
    ? {
        username: String(auth.username || "User"),
        role: normalizeRole(auth.role),
      }
    : null;

  const elements = {
    inventoryGrid:
      document.getElementById("inventory-grid"),

    adminSection:
      document.getElementById("admin-section"),

    userRequestsSection:
      document.getElementById(
        "user-requests-section"
      ),

    userPendingList:
      document.getElementById(
        "user-pending-list"
      ),

    userRentalsSection:
      document.getElementById(
        "user-rentals-section"
      ),

    userRentalsList:
      document.getElementById(
        "user-rentals-list"
      ),

    userRoleLabel:
      document.getElementById("user-role-label"),

    loginBtn:
      document.getElementById("login-btn"),

    logoutBtn:
      document.getElementById("logout-btn"),

    cartBtn:
      document.getElementById("cart-btn"),

    cartCount:
      document.getElementById("cart-count"),

    loginModal:
      document.getElementById("login-modal"),

    loginForm:
      document.getElementById("login-form"),

    loginSubmit:
      document.getElementById("login-submit"),

    loginCancel:
      document.getElementById("login-cancel"),

    loginError:
      document.getElementById("login-error"),

    cartModal:
      document.getElementById("cart-modal"),

    requestForm:
      document.getElementById("request-form"),

    requestHiddenFields:
      document.getElementById(
        "request-hidden-fields"
      ),

    requestTotal:
      document.getElementById("request-total"),

    cartItems:
      document.getElementById("cart-items"),

    cartClose:
      document.getElementById("cart-close"),

    clearCart:
      document.getElementById("clear-cart"),

    submitRequest:
      document.getElementById(
        "submit-rental-request"
      ),

    notificationModal:
      document.getElementById(
        "notification-modal"
      ),

    notificationText:
      document.getElementById(
        "notification-text"
      ),

    notificationClose:
      document.getElementById(
        "notification-close"
      ),

    requestsList:
      document.getElementById("requests-list"),

    rentalHistoryList:
      document.getElementById(
        "rental-history-list"
      ),

    addItemForm:
      document.getElementById("add-item-form"),

    updateItemForm:
      document.getElementById(
        "update-item-form"
      ),

    deleteItemForm:
      document.getElementById(
        "delete-item-form"
      ),

    damageItemForm:
      document.getElementById(
        "damage-item-form"
      ),

    updateItemSelect:
      document.getElementById(
        "update-item-select"
      ),

    deleteItemSelect:
      document.getElementById(
        "delete-item-name"
      ),

    damageItemSelect:
      document.getElementById(
        "damage-item-name"
      ),

    clearAddItem:
      document.getElementById(
        "clear-add-item-btn"
      ),

    resetUpdateItem:
      document.getElementById(
        "reset-update-item-btn"
      ),
  };

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

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function positiveInteger(
    value,
    fallback = 1
  ) {
    const number = toInteger(value, fallback);

    return number > 0
      ? number
      : fallback;
  }

  function normalizeRole(role) {
    const normalized = String(role || "")
      .trim()
      .toLowerCase();

    return [
      "admin",
      "manager",
      "lab admin",
    ].includes(normalized)
      ? "admin"
      : "user";
  }

  function normalizeInventoryItem(
    item,
    index = 0
  ) {
    const name =
      item.name ??
      item.item_name ??
      item.itemName ??
      "Unnamed Item";

    const available =
      item.quantity_available ??
      item.quantityAvailable ??
      item.quantity ??
      item.quantity_total ??
      0;

    const total =
      item.quantity_total ??
      item.quantityTotal ??
      item.totalQuantity ??
      available;

    return {
      id: String(
        item.item_id ??
          item.inventory_id ??
          item.id ??
          `item-${index}`
      ),

      name: String(name),

      category: String(
        item.item_category ??
          item.category ??
          "General"
      ),

      condition: String(
        item.item_condition ??
          item.condition ??
          "Good"
      ),

      quantityAvailable: Math.max(
        0,
        toInteger(available, 0)
      ),

      quantityTotal: Math.max(
        0,
        toInteger(total, 0)
      ),

      description: String(
        item.description ??
          "No description provided."
      ),

      availabilityStatus: String(
        item.availability_status ??
          item.availabilityStatus ??
          "Available"
      ),

      checkoutDays: Math.min(
        60,
        positiveInteger(
          item.rental_period_days ??
            item.checkout_days ??
            item.checkoutDays,
          7
        )
      ),
    };
  }

  function normalizeRequestItem(
    item,
    index = 0
  ) {
    return {
      itemId: String(
        item.item_id ??
          item.itemId ??
          `request-item-${index}`
      ),

      itemName: String(
        item.item_name ??
          item.itemName ??
          item.name ??
          "Unknown Item"
      ),

      quantity: positiveInteger(
        item.quantity_requested ??
          item.quantity,
        1
      ),

      checkoutDays: Math.min(
        60,
        positiveInteger(
          item.rental_period_days ??
            item.checkout_days ??
            item.checkoutDays,
          7
        )
      ),
    };
  }

  function normalizeRequest(
    request,
    index = 0
  ) {
    const items =
      request.items ??
      request.request_items ??
      [];

    return {
      id: String(
        request.request_id ??
          request.id ??
          `request-${index}`
      ),

      username: String(
        request.username ??
          request.user_name ??
          request.email ??
          ""
      ),

      status: String(
        request.request_status ??
          request.status ??
          "Pending"
      ).toLowerCase(),

      requestDate:
        request.request_date ??
        request.requestDateISO ??
        null,

      dueDate:
        request.due_date ??
        request.dueDateISO ??
        null,

      returnedDate:
        request.returned_date ??
        request.returnedDateISO ??
        null,

      belongsToCurrentUser: Boolean(
        request.belongs_to_current_user ??
          request.belongsToCurrentUser
      ),

      items: Array.isArray(items)
        ? items.map(normalizeRequestItem)
        : [],
    };
  }

  function showModal(modal) {
    modal?.classList.remove("hidden");
  }

  function hideModal(modal) {
    modal?.classList.add("hidden");
  }

  function showNotification(message) {
    elements.notificationText.textContent =
      message;

    showModal(elements.notificationModal);
  }

  function setLoginError(message) {
    elements.loginError.textContent =
      message;

    elements.loginError.classList.toggle(
      "hidden",
      !message
    );
  }

  function formatDate(value) {
    if (!value) {
      return "Not set";
    }

    const raw = String(value);

    const dateOnly =
      /^\d{4}-\d{2}-\d{2}$/.test(raw);

    const date = new Date(
      dateOnly
        ? `${raw}T00:00:00`
        : raw
    );

    if (Number.isNaN(date.getTime())) {
      return raw;
    }

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (!dateOnly) {
      options.hour = "numeric";
      options.minute = "2-digit";
    }

    return date.toLocaleString([], options);
  }

  function formatDays(days) {
    const value = positiveInteger(days, 1);

    return `${value} ${
      value === 1
        ? "day"
        : "days"
    }`;
  }

  function statusBadge(
    status,
    dueDate
  ) {
    let normalized = String(
      status || "pending"
    ).toLowerCase();

    if (
      normalized === "approved" &&
      dueDate &&
      new Date(dueDate) < new Date()
    ) {
      normalized = "overdue";
    }

    const label =
      normalized.charAt(0).toUpperCase() +
      normalized.slice(1);

    return `
      <span class="badge ${escapeHTML(normalized)}">
        ${escapeHTML(label)}
      </span>
    `;
  }

  function inventoryStatus(item) {
    const condition =
      item.condition.toLowerCase();

    const status =
      item.availabilityStatus.toLowerCase();

    if (
      item.quantityAvailable <= 0 ||
      condition.includes("unavailable") ||
      status.includes("unavailable")
    ) {
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

    if (item.quantityAvailable <= 3) {
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

  function findInventoryItem(identifier) {
    const value = String(identifier || "")
      .toLowerCase();

    return inventory.find(
      (item) =>
        item.id.toLowerCase() === value ||
        item.name.toLowerCase() === value
    );
  }

  function renderInventory() {
    elements.inventoryGrid.innerHTML = "";

    inventory.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (inventory.length === 0) {
      elements.inventoryGrid.innerHTML = `
        <div class="empty-state">
          No inventory data was supplied by the
          backend.
        </div>
      `;

      return;
    }

    inventory.forEach((item) => {
      const status = inventoryStatus(item);

      const card =
        document.createElement("article");

      card.className = "equipment-card";

      card.innerHTML = `
        <div class="card-top">
          <div>
            <h3 class="item-title">
              ${escapeHTML(item.name)}
            </h3>

            <p class="item-category">
              ${escapeHTML(item.category)}
            </p>
          </div>

          <span class="badge ${escapeHTML(status.className)}">
            ${escapeHTML(status.label)}
          </span>
        </div>

        <p class="record-meta item-description">
          ${escapeHTML(item.description)}
        </p>

        <div class="detail-list">
          <div>
            <span>Available:</span>
            ${escapeHTML(item.quantityAvailable)}
          </div>

          <div>
            <span>Condition:</span>
            ${escapeHTML(item.condition)}
          </div>

          <div>
            <span>Default Checkout:</span>
            ${escapeHTML(
              formatDays(item.checkoutDays)
            )}
          </div>
        </div>
      `;

      if (currentUser?.role !== "admin") {
        const options =
          document.createElement("div");

        options.className = "option-stack";

        options.innerHTML = `
          <label>
            Quantity requested

            <input
              class="request-quantity"
              type="number"
              min="1"
              max="${item.quantityAvailable}"
              value="1"
              ${
                item.quantityAvailable <= 0
                  ? "disabled"
                  : ""
              }
            >
          </label>

          <label>
            Requested checkout days

            <input
              class="request-days"
              type="number"
              min="1"
              max="60"
              value="${item.checkoutDays}"
              ${
                item.quantityAvailable <= 0
                  ? "disabled"
                  : ""
              }
            >
          </label>
        `;

        card.appendChild(options);

        const actions =
          document.createElement("div");

        actions.className = "card-actions";

        const addButton =
          document.createElement("button");

        addButton.type = "button";

        addButton.className =
          "primary-btn request-card-btn";

        addButton.textContent =
          "Add to Request";

        addButton.disabled =
          item.quantityAvailable <= 0 ||
          status.className === "damaged";

        addButton.addEventListener(
          "click",
          () => {
            const quantity = toInteger(
              options.querySelector(
                ".request-quantity"
              ).value,
              0
            );

            const checkoutDays = toInteger(
              options.querySelector(
                ".request-days"
              ).value,
              0
            );

            const existing = cart.find(
              (entry) =>
                entry.itemId === item.id
            );

            const alreadyRequested =
              existing?.quantity || 0;

            if (
              quantity < 1 ||
              alreadyRequested + quantity >
                item.quantityAvailable
            ) {
              showNotification(
                `The total requested quantity for ${item.name} cannot exceed ${item.quantityAvailable}.`
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

            if (existing) {
              existing.quantity += quantity;

              existing.checkoutDays =
                checkoutDays;
            } else {
              cart.push({
                itemId: item.id,
                itemName: item.name,
                quantity,
                checkoutDays,
              });
            }

            updateCartCount();

            showNotification(
              `${item.name} was added to the request list.`
            );
          }
        );

        actions.appendChild(addButton);
        card.appendChild(actions);
      }

      elements.inventoryGrid.appendChild(
        card
      );
    });
  }

  function updateCartCount() {
    const count = cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

    elements.cartCount.textContent =
      count;

    elements.requestTotal.textContent =
      `${count} ${
        count === 1
          ? "item"
          : "items"
      }`;

    elements.submitRequest.disabled =
      count === 0;

    elements.clearCart.disabled =
      count === 0;
  }

  function renderCart() {
    elements.cartItems.innerHTML = "";

    if (cart.length === 0) {
      elements.cartItems.innerHTML = `
        <div class="empty-state">
          Your request list is empty.
        </div>
      `;

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

      card.innerHTML = `
        <div class="record-header">
          <div>
            <p class="record-title">
              ${escapeHTML(entry.itemName)}
            </p>

            <p class="record-meta">
              Available:
              ${escapeHTML(
                inventoryItem
                  ?.quantityAvailable ?? 0
              )}
            </p>
          </div>

          <button
            class="remove-btn"
            type="button"
          >
            Remove
          </button>
        </div>

        <div class="request-line-fields">
          <label>
            Quantity

            <input
              class="cart-quantity"
              type="number"
              min="1"
              max="${escapeHTML(
                inventoryItem
                  ?.quantityAvailable ??
                  entry.quantity
              )}"
              value="${escapeHTML(
                entry.quantity
              )}"
            >
          </label>

          <label>
            Checkout Days

            <input
              class="cart-days"
              type="number"
              min="1"
              max="60"
              value="${escapeHTML(
                entry.checkoutDays
              )}"
            >
          </label>
        </div>
      `;

      card
        .querySelector(".cart-quantity")
        .addEventListener(
          "change",
          (event) => {
            const value = toInteger(
              event.target.value,
              0
            );

            const maximum =
              inventoryItem
                ?.quantityAvailable ??
              entry.quantity;

            if (
              value < 1 ||
              value > maximum
            ) {
              event.target.value =
                entry.quantity;

              showNotification(
                `Quantity must be between 1 and ${maximum}.`
              );

              return;
            }

            entry.quantity = value;

            updateCartCount();
          }
        );

      card
        .querySelector(".cart-days")
        .addEventListener(
          "change",
          (event) => {
            const value = toInteger(
              event.target.value,
              0
            );

            if (
              value < 1 ||
              value > 60
            ) {
              event.target.value =
                entry.checkoutDays;

              showNotification(
                "Checkout days must be between 1 and 60."
              );

              return;
            }

            entry.checkoutDays = value;
          }
        );

      card
        .querySelector(".remove-btn")
        .addEventListener(
          "click",
          () => {
            cart = cart.filter(
              (item) =>
                item.itemId !==
                entry.itemId
            );

            renderCart();
          }
        );

      elements.cartItems.appendChild(
        card
      );
    });

    updateCartCount();
  }

  function appendHiddenField(
    name,
    value
  ) {
    const input =
      document.createElement("input");

    input.type = "hidden";
    input.name = name;
    input.value = String(value ?? "");

    elements.requestHiddenFields.appendChild(
      input
    );
  }

  function prepareRequestForm() {
    elements.requestHiddenFields.innerHTML =
      "";

    const items = cart.map((entry) => ({
      item_id: entry.itemId,
      item_name: entry.itemName,
      quantity_requested: entry.quantity,
      checkout_days: entry.checkoutDays,
    }));

    appendHiddenField(
      "request_items",
      JSON.stringify(items)
    );
  }

  function extractFlashMessage(html) {
    if (!html) {
      return "";
    }

    const parsed =
      new DOMParser().parseFromString(
        html,
        "text/html"
      );

    return (
      parsed
        .querySelector(".flash-message")
        ?.textContent?.trim() || ""
    );
  }

  async function postForm(
    url,
    formData
  ) {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "same-origin",

      headers: {
        "X-Requested-With":
          "XMLHttpRequest",
      },
    });

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    const data =
      contentType.includes(
        "application/json"
      )
        ? await response
            .json()
            .catch(() => null)
        : null;

    const text =
      data === null
        ? await response
            .text()
            .catch(() => "")
        : "";

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          extractFlashMessage(text) ||
          "The server could not complete this action."
      );
    }

    return {
      response,
      data,
      text,
    };
  }

  async function submitRequest(event) {
    event.preventDefault();

    if (!currentUser) {
      hideModal(elements.cartModal);

      setLoginError(
        "Log in before submitting an equipment request."
      );

      showModal(elements.loginModal);

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

    for (const entry of cart) {
      const item = findInventoryItem(
        entry.itemId
      );

      if (
        !item ||
        entry.quantity >
          item.quantityAvailable
      ) {
        showNotification(
          `${entry.itemName} is no longer available in that quantity.`
        );

        return;
      }
    }

    prepareRequestForm();

    elements.submitRequest.disabled =
      true;

    elements.submitRequest.textContent =
      "Submitting...";

    try {
      const result = await postForm(
        routes.submitRequestUrl ||
          elements.requestForm.action,

        new FormData(
          elements.requestForm
        )
      );

      if (
        result.response.redirected &&
        result.response.url
      ) {
        window.location.assign(
          result.response.url
        );

        return;
      }

      cart = [];

      window.location.reload();
    } catch (error) {
      showNotification(error.message);
    } finally {
      elements.submitRequest.textContent =
        "Submit Request";

      updateCartCount();
    }
  }

  function renderRequestItems(items) {
    if (!items.length) {
      return `
        <p class="record-meta">
          No request-item data was supplied.
        </p>
      `;
    }

    return `
      <ul class="item-list">
        ${items
          .map(
            (item) => `
              <li>
                <strong>
                  ${escapeHTML(item.quantity)}×
                  ${escapeHTML(item.itemName)}
                </strong>

                —
                ${escapeHTML(
                  formatDays(
                    item.checkoutDays
                  )
                )}
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  }

  function belongsToCurrentUser(
    request
  ) {
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
      currentUser?.role !== "user"
    ) {
      elements.userRequestsSection.classList.add(
        "hidden"
      );

      return;
    }

    elements.userRequestsSection.classList.remove(
      "hidden"
    );

    const requests =
      pendingRequests.filter(
        belongsToCurrentUser
      );

    elements.userPendingList.innerHTML =
      requests.length
        ? requests
            .map(
              (request) => `
                <article class="record-card">
                  <div class="record-header">
                    <div>
                      <p class="record-title">
                        Request #${escapeHTML(
                          request.id
                        )}
                      </p>

                      <p class="record-meta">
                        Submitted:
                        ${escapeHTML(
                          formatDate(
                            request.requestDate
                          )
                        )}
                      </p>
                    </div>

                    ${statusBadge("pending")}
                  </div>

                  ${renderRequestItems(
                    request.items
                  )}
                </article>
              `
            )
            .join("")
        : `
            <div class="empty-state">
              No pending-request data was
              supplied by the backend.
            </div>
          `;
  }

  function renderAdminRequests() {
    elements.requestsList.innerHTML = "";

    if (!pendingRequests.length) {
      elements.requestsList.innerHTML = `
        <div class="empty-state">
          No pending-request data was supplied
          by the backend.
        </div>
      `;

      return;
    }

    pendingRequests.forEach((request) => {
      const form =
        document.createElement("form");

      form.className = "record-card";
      form.method = "POST";

      form.action =
        routes.requestDecisionUrl ||
        "/request-decision";

      form.innerHTML = `
        <input
          type="hidden"
          name="request_id"
          value="${escapeHTML(request.id)}"
        >

        <div class="record-header">
          <div>
            <p class="record-title">
              Request #${escapeHTML(
                request.id
              )}

              ${
                request.username
                  ? `— ${escapeHTML(
                      request.username
                    )}`
                  : ""
              }
            </p>

            <p class="record-meta">
              Submitted:
              ${escapeHTML(
                formatDate(
                  request.requestDate
                )
              )}
            </p>
          </div>

          ${statusBadge("pending")}
        </div>

        ${renderRequestItems(
          request.items
        )}

        <div class="record-actions">
          <button
            class="approve-btn"
            type="submit"
            name="decision"
            value="approve"
          >
            Approve
          </button>

          <button
            class="deny-btn"
            type="submit"
            name="decision"
            value="deny"
          >
            Deny
          </button>
        </div>
      `;

      form.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();

          const decision =
            event.submitter?.value;

          if (!decision) {
            return;
          }

          const formData =
            new FormData(form);

          formData.set(
            "decision",
            decision
          );

          form
            .querySelectorAll("button")
            .forEach((button) => {
              button.disabled = true;
            });

          try {
            await postForm(
              form.action,
              formData
            );

            window.location.reload();
          } catch (error) {
            showNotification(
              error.message
            );

            form
              .querySelectorAll("button")
              .forEach((button) => {
                button.disabled = false;
              });
          }
        }
      );

      elements.requestsList.appendChild(
        form
      );
    });
  }

  function renderHistoryCard(
    entry,
    adminView
  ) {
    const card =
      document.createElement("article");

    card.className = "record-card";

    card.innerHTML = `
      <div class="record-header">
        <div>
          <p class="record-title">
            Request #${escapeHTML(entry.id)}

            ${
              adminView && entry.username
                ? `— ${escapeHTML(
                    entry.username
                  )}`
                : ""
            }
          </p>

          <p class="record-meta">
            Requested:
            ${escapeHTML(
              formatDate(
                entry.requestDate
              )
            )}
          </p>

          <p class="record-meta">
            Due:
            ${escapeHTML(
              formatDate(entry.dueDate)
            )}
          </p>

          ${
            entry.returnedDate
              ? `
                <p class="record-meta">
                  Returned:
                  ${escapeHTML(
                    formatDate(
                      entry.returnedDate
                    )
                  )}
                </p>
              `
              : ""
          }
        </div>

        ${statusBadge(
          entry.status,
          entry.dueDate
        )}
      </div>

      ${renderRequestItems(entry.items)}
    `;

    const normalizedStatus = String(
      entry.status || ""
    ).toLowerCase();

    if (
      adminView &&
      [
        "approved",
        "overdue",
      ].includes(normalizedStatus)
    ) {
      const form =
        document.createElement("form");

      form.className = "record-actions";
      form.method = "POST";

      form.action =
        routes.processReturnUrl ||
        "/process-return";

      form.innerHTML = `
        <input
          type="hidden"
          name="request_id"
          value="${escapeHTML(entry.id)}"
        >

        <button
          class="return-btn"
          type="submit"
        >
          Process Return
        </button>
      `;

      form.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();

          const button =
            form.querySelector("button");

          button.disabled = true;

          try {
            await postForm(
              form.action,
              new FormData(form)
            );

            window.location.reload();
          } catch (error) {
            showNotification(
              error.message
            );

            button.disabled = false;
          }
        }
      );

      card.appendChild(form);
    }

    return card;
  }

  function renderRentalHistory() {
    elements.rentalHistoryList.innerHTML =
      "";

    if (!rentalHistory.length) {
      elements.rentalHistoryList.innerHTML = `
        <div class="empty-state">
          No rental-history data was supplied
          by the backend.
        </div>
      `;

      return;
    }

    rentalHistory.forEach((entry) => {
      elements.rentalHistoryList.appendChild(
        renderHistoryCard(entry, true)
      );
    });
  }

  function renderUserHistory() {
    if (
      currentUser?.role !== "user"
    ) {
      elements.userRentalsSection.classList.add(
        "hidden"
      );

      return;
    }

    elements.userRentalsSection.classList.remove(
      "hidden"
    );

    elements.userRentalsList.innerHTML =
      "";

    const entries =
      rentalHistory.filter(
        belongsToCurrentUser
      );

    if (!entries.length) {
      elements.userRentalsList.innerHTML = `
        <div class="empty-state">
          No rental-history data was supplied
          by the backend.
        </div>
      `;

      return;
    }

    entries.forEach((entry) => {
      elements.userRentalsList.appendChild(
        renderHistoryCard(entry, false)
      );
    });
  }

  function syncAuthUI() {
    if (!currentUser) {
      elements.userRoleLabel.textContent =
        "Not logged in";

      elements.loginBtn.classList.remove(
        "hidden"
      );

      elements.logoutBtn.classList.add(
        "hidden"
      );

      elements.cartBtn.classList.remove(
        "hidden"
      );

      elements.adminSection.classList.add(
        "hidden"
      );

      elements.userRequestsSection.classList.add(
        "hidden"
      );

      elements.userRentalsSection.classList.add(
        "hidden"
      );

      return;
    }

    elements.userRoleLabel.textContent =
      `Logged in as ${currentUser.username} (${currentUser.role})`;

    elements.loginBtn.classList.add(
      "hidden"
    );

    elements.logoutBtn.classList.remove(
      "hidden"
    );

    if (currentUser.role === "admin") {
      elements.adminSection.classList.remove(
        "hidden"
      );

      elements.userRequestsSection.classList.add(
        "hidden"
      );

      elements.userRentalsSection.classList.add(
        "hidden"
      );

      elements.cartBtn.classList.add(
        "hidden"
      );

      refreshInventorySelects();
    } else {
      elements.adminSection.classList.add(
        "hidden"
      );

      elements.userRequestsSection.classList.remove(
        "hidden"
      );

      elements.userRentalsSection.classList.remove(
        "hidden"
      );

      elements.cartBtn.classList.remove(
        "hidden"
      );
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    setLoginError("");

    elements.loginSubmit.disabled = true;

    elements.loginSubmit.textContent =
      "Logging In...";

    try {
      const response = await fetch(
        elements.loginForm.action,
        {
          method: "POST",

          body: new FormData(
            elements.loginForm
          ),

          credentials: "same-origin",

          headers: {
            "X-Requested-With":
              "XMLHttpRequest",
          },
        }
      );

      const html =
        await response.text();

      if (
        response.ok &&
        response.redirected
      ) {
        window.location.assign(
          response.url || "/"
        );

        return;
      }

      setLoginError(
        extractFlashMessage(html) ||
          "The username, password, or selected role is incorrect."
      );
    } catch {
      setLoginError(
        "The login request could not reach the server."
      );
    } finally {
      elements.loginSubmit.disabled =
        false;

      elements.loginSubmit.textContent =
        "Log In";
    }
  }

  async function handleLogout() {
    elements.logoutBtn.disabled = true;

    elements.logoutBtn.textContent =
      "Logging Out...";

    try {
      const response = await fetch(
        routes.logoutUrl ||
          auth.logoutUrl ||
          "/logout",
        {
          method: "GET",
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout could not be completed."
        );
      }

      window.location.assign(
        response.redirected
          ? response.url
          : "/"
      );
    } catch (error) {
      showNotification(error.message);

      elements.logoutBtn.disabled =
        false;

      elements.logoutBtn.textContent =
        "Logout";
    }
  }

  function populateSelect(
    select,
    placeholder
  ) {
    const previousValue =
      select.value;

    select.innerHTML = "";

    select.add(
      new Option(placeholder, "")
    );

    inventory.forEach((item) => {
      select.add(
        new Option(item.name, item.id)
      );
    });

    if (
      inventory.some(
        (item) =>
          item.id === previousValue
      )
    ) {
      select.value = previousValue;
    }
  }

  function refreshInventorySelects() {
    populateSelect(
      elements.updateItemSelect,
      "Select an item to edit"
    );

    populateSelect(
      elements.deleteItemSelect,
      "Select an item to delete"
    );

    populateSelect(
      elements.damageItemSelect,
      "Select an item to damage out"
    );

    populateUpdateForm();
  }

  function populateUpdateForm() {
    const item = findInventoryItem(
      elements.updateItemSelect.value
    );

    const fieldIds = [
      "update-item-name",
      "update-item-category",
      "update-item-condition",
      "update-item-qty",
      "update-item-description",
      "update-item-checkout-days",
      "update-item-btn",
      "reset-update-item-btn",
    ];

    fieldIds.forEach((id) => {
      document.getElementById(id).disabled =
        !item;
    });

    document.getElementById(
      "update-item-name"
    ).value = item?.name || "";

    document.getElementById(
      "update-item-category"
    ).value = item?.category || "";

    document.getElementById(
      "update-item-condition"
    ).value =
      item?.condition || "Good";

    document.getElementById(
      "update-item-qty"
    ).value = item
      ? String(item.quantityTotal)
      : "";

    document.getElementById(
      "update-item-description"
    ).value =
      item?.description || "";

    document.getElementById(
      "update-item-checkout-days"
    ).value = item
      ? String(item.checkoutDays)
      : "";
  }

  async function submitInventoryForm(
    event,
    workingText
  ) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const button =
      event.submitter ||
      form.querySelector(
        'button[type="submit"]'
      );

    const originalText =
      button.textContent;

    button.disabled = true;
    button.textContent = workingText;

    try {
      const result = await postForm(
        form.action,
        new FormData(form)
      );

      const message =
        extractFlashMessage(result.text);

      if (message) {
        showNotification(message);

        return;
      }

      window.location.reload();
    } catch (error) {
      showNotification(error.message);
    } finally {
      button.disabled = false;

      button.textContent =
        originalText;
    }
  }

  document
    .querySelectorAll(".tab-btn")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(".tab-btn")
            .forEach((item) => {
              item.classList.remove(
                "active"
              );
            });

          document
            .querySelectorAll(
              ".tab-content"
            )
            .forEach((item) => {
              item.classList.remove(
                "active"
              );
            });

          button.classList.add(
            "active"
          );

          document
            .getElementById(
              button.dataset.tab
            )
            .classList.add("active");

          if (
            [
              "update-item-tab",
              "modify-items-tab",
            ].includes(
              button.dataset.tab
            )
          ) {
            refreshInventorySelects();
          }
        }
      );
    });

  elements.loginBtn.addEventListener(
    "click",
    () => {
      setLoginError("");

      showModal(elements.loginModal);
    }
  );

  elements.loginForm.addEventListener(
    "submit",
    handleLogin
  );

  elements.loginCancel.addEventListener(
    "click",
    () => {
      hideModal(elements.loginModal);
    }
  );

  elements.logoutBtn.addEventListener(
    "click",
    handleLogout
  );

  elements.cartBtn.addEventListener(
    "click",
    () => {
      renderCart();

      showModal(elements.cartModal);
    }
  );

  elements.cartClose.addEventListener(
    "click",
    () => {
      hideModal(elements.cartModal);
    }
  );

  elements.clearCart.addEventListener(
    "click",
    () => {
      cart = [];

      renderCart();
    }
  );

  elements.requestForm.addEventListener(
    "submit",
    submitRequest
  );

  elements.notificationClose.addEventListener(
    "click",
    () => {
      hideModal(
        elements.notificationModal
      );
    }
  );

  [
    elements.loginModal,
    elements.cartModal,
    elements.notificationModal,
  ].forEach((modal) => {
    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) {
          hideModal(modal);
        }
      }
    );
  });

  elements.addItemForm.addEventListener(
    "submit",
    (event) => {
      submitInventoryForm(
        event,
        "Adding..."
      );
    }
  );

  elements.updateItemForm.addEventListener(
    "submit",
    (event) => {
      submitInventoryForm(
        event,
        "Saving..."
      );
    }
  );

  elements.deleteItemForm.addEventListener(
    "submit",
    (event) => {
      submitInventoryForm(
        event,
        "Deleting..."
      );
    }
  );

  elements.damageItemForm.addEventListener(
    "submit",
    (event) => {
      submitInventoryForm(
        event,
        "Updating..."
      );
    }
  );

  elements.clearAddItem.addEventListener(
    "click",
    () => {
      elements.addItemForm.reset();
    }
  );

  elements.updateItemSelect.addEventListener(
    "change",
    populateUpdateForm
  );

  elements.resetUpdateItem.addEventListener(
    "click",
    populateUpdateForm
  );

  syncAuthUI();
  renderInventory();
  renderCart();
  renderUserPendingRequests();
  renderAdminRequests();
  renderRentalHistory();
  renderUserHistory();
});