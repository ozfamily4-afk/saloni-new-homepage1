(function() {
  "use strict";
  
  var API_URL = "https://script.google.com/macros/s/AKfycbyq1fZg1aXzKeSu_aDe0n1GrIC6x1PuaDvv2yhdioUMnAnx9ZbJLpuh7GUPiOZKvKhbMA/exec";
  var ZAPIER_URL = "https://hooks.zapier.com/hooks/catch/26176320/uqah9h6/";
  var currentContractId = null;
  var currentContractData = null;
  var isViewMode = false;
  
  function getUrlParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  window.formatMoney = function(cents) {
    var amount = (cents / 100).toFixed(2);
    var parts = amount.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".") + " USD";
  };

  window.formatPhoneNumber = function(phone) {
    if (!phone) return "";
    phone = phone.toString().replace(/\D/g, "");
    if (phone.startsWith("90")) return "+" + phone;
    if (phone.startsWith("0")) return "+90" + phone.substring(1);
    if (phone.length === 10) return "+90" + phone;
    return "+90" + phone;
  };

  function fixImageUrl(url) {
    if (!url) return "";
    url = url.trim();
    if (url.startsWith("//")) {
      return "https:" + url;
    }
    if (!url.startsWith("http") && url.length > 0) {
      return "https://" + url;
    }
    return url;
  }

  function postToAPI(data) {
    return fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      try {
        return JSON.parse(text);
      } catch(e) {
        console.log("Response text:", text);
        return { success: true };
      }
    });
  }

  function createProductCard(product, index, isReadOnly) {
    var basePrice = Math.round((product.base_price || 0));
    var qty = product.quantity || 1;
    var finalPrice = product.final_price || (basePrice * qty);
    var pctDiscount = product.pct_discount || 0;
    var fixedDiscount = product.fixed_discount || 0;
    var notes = product.notes || "";
    var rawImage = product.image || product.productImage || product.img || "";
    var image = fixImageUrl(rawImage);
    var name = product.name || "Product";
    
    var hasDiscount = pctDiscount > 0 || fixedDiscount > 0;
    var oldPriceDisplay = hasDiscount ? 'style="display:inline;"' : 'style="display:none;"';
    var discountLabelDisplay = hasDiscount ? 'style="display:block;"' : 'style="display:none;"';
    
    var discountDetails = [];
    if (pctDiscount > 0) discountDetails.push("%" + pctDiscount);
    if (fixedDiscount > 0) discountDetails.push(fixedDiscount.toLocaleString() + " USD");
    var discountText = discountDetails.length > 0 ? 'Discount: <span class="value-text">' + discountDetails.join(" + ") + '</span>' : '';
    
    var noShowClass = isReadOnly ? 'style="display:none;"' : '';
    
    var imageHtml = '';
    if (image && image.length > 5) {
      imageHtml = '<img src="' + image + '" alt="' + name + '" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.parentElement.innerHTML=\'<div style=padding:20px;color:#999;font-size:11px;>No Image</div>\'">';
    } else {
      imageHtml = '<div style="padding:20px;color:#999;font-size:11px;">No Image</div>';
    }
    
    var html = '<div class="product-card js-product-item" data-base-price="' + basePrice + '" data-qty="' + qty + '" data-current-total="' + finalPrice + '" data-index="' + index + '" data-image="' + image + '">' +
      '<div class="img-area">' + imageHtml + '</div>' +
      '<div class="details-area">' +
        '<div class="item-name">' + name + '</div>' +
        '<div class="writing-lines"><textarea class="item-notes" placeholder="Item Details...">' + notes + '</textarea></div>' +
        '<div class="price-tag">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-end;">' +
            '<span style="font-size:10px; color:#999;">QTY: ' + qty + '</span>' +
            '<div class="price-display">' +
              '<del class="js-old-price" ' + oldPriceDisplay + '>' + formatMoney(basePrice * qty) + '</del>' +
              '<span class="final-price js-cur-price">' + formatMoney(finalPrice) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="discount-label js-discount-applied" ' + discountLabelDisplay + '>' + discountText + '</div>' +
        '</div>' +
        '<div class="no-print" ' + noShowClass + '>' +
          '<div class="chip js-discount-10">%10</div>' +
          '<div class="chip js-discount-20">%20</div>' +
          '<input type="number" class="chip custom-disc js-item-pct" placeholder="%" value="' + (pctDiscount || '') + '">' +
          '<input type="number" class="chip custom-fixed js-item-fixed" placeholder="USD" value="' + (fixedDiscount || '') + '">' +
          '<div class="chip reset-btn js-reset-item">Reset</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    return html;
  }

  function renderProducts(products, isReadOnly) {
    var grid = document.getElementById("product-grid");
    if (!grid || !products || products.length === 0) return;
    
    var html = products.map(function(prod, idx) {
      return createProductCard(prod, idx, isReadOnly);
    }).join("");
    
    grid.innerHTML = html;
    
    initProductEvents();
    recalcTotal();
  }

  function initProductEvents() {
    document.querySelectorAll(".js-product-item").forEach(function(card) {
      var disc10 = card.querySelector(".js-discount-10");
      var disc20 = card.querySelector(".js-discount-20");
      var pctInput = card.querySelector(".js-item-pct");
      var fixedInput = card.querySelector(".js-item-fixed");
      var resetBtn = card.querySelector(".js-reset-item");
      
      if(disc10) disc10.onclick = function() {
        pctInput.value = 10;
        recalcItem(pctInput);
      };
      
      if(disc20) disc20.onclick = function() {
        pctInput.value = 20;
        recalcItem(pctInput);
      };
      
      if(pctInput) pctInput.oninput = function() {
        recalcItem(this);
      };
      
      if(fixedInput) fixedInput.oninput = function() {
        recalcItem(this);
      };
      
      if(resetBtn) resetBtn.onclick = function() {
        pctInput.value = "";
        fixedInput.value = "";
        recalcItem(pctInput);
      };
    });
  }

  window.recalcItem = function(el) {
    var card = el.closest(".js-product-item");
    var basePrice = parseInt(card.getAttribute("data-base-price"));
    var qty = parseInt(card.getAttribute("data-qty"));
    var pctVal = parseFloat(card.querySelector(".js-item-pct").value) || 0;
    var fixedVal = parseFloat(card.querySelector(".js-item-fixed").value) || 0;
    var oldPriceEl = card.querySelector(".js-old-price");
    var curPriceEl = card.querySelector(".js-cur-price");
    var label = card.querySelector(".js-discount-applied");

    if (pctVal > 0 || fixedVal > 0) {
      var discUnitPrice = basePrice * (1 - (pctVal / 100)) - (fixedVal * 100);
      oldPriceEl.innerText = formatMoney(basePrice * qty);
      oldPriceEl.style.display = "inline";
      curPriceEl.innerText = formatMoney(discUnitPrice * qty);
      var details = [];
      if(pctVal > 0) details.push("%" + pctVal);
      if(fixedVal > 0) details.push(fixedVal.toLocaleString() + " USD");
      label.innerHTML = "Discount: <span class=\"value-text\">" + details.join(" + ") + "</span>";
      label.style.display = "block";
      card.setAttribute("data-current-total", discUnitPrice * qty);
    } else {
      oldPriceEl.style.display = "none";
      curPriceEl.innerText = formatMoney(basePrice * qty);
      label.style.display = "none";
      card.setAttribute("data-current-total", basePrice * qty);
    }
    recalcTotal();
  };

  window.recalcTotal = function() {
    var subTotal = 0;
    document.querySelectorAll(".js-product-item").forEach(function(c) {
      subTotal += parseFloat(c.getAttribute("data-current-total") || (parseInt(c.getAttribute("data-base-price")) * parseInt(c.getAttribute("data-qty"))));
    });
    
    var area = document.querySelector(".js-total-area");
    if (!area) return;
    
    var pctInput = area.querySelector(".js-total-pct");
    var pctVal = pctInput ? (parseFloat(pctInput.value) || 0) : 0;
    var finalDisplay = document.querySelector(".js-final-total");
    var oldDisplay = document.querySelector(".js-old-total");
    var lbl = document.querySelector(".js-total-discount-label");

    if (pctVal > 0) {
      var finalAmount = subTotal * (1 - (pctVal / 100));
      if (oldDisplay) {
        oldDisplay.innerText = formatMoney(subTotal);
        oldDisplay.style.display = "block";
      }
      if (finalDisplay) finalDisplay.innerText = formatMoney(finalAmount);
      if (lbl) {
        lbl.innerHTML = "Total Discount: <span class=\"value-text\" style=\"color:var(--brand-primary)\">%" + pctVal + "</span>";
        lbl.style.display = "inline-block";
      }
    } else {
      if (oldDisplay) oldDisplay.style.display = "none";
      if (finalDisplay) finalDisplay.innerText = formatMoney(subTotal);
      if (lbl) lbl.style.display = "none";
    }
  };

  function getContractData() {
    var repEl = document.getElementById("sales-rep-select");
    var phoneInp = document.getElementById("client-phone");
    var clientNameInp = document.getElementById("client-name");
    var addressEl = document.getElementById("client-address");
    var deliveryEl = document.getElementById("delivery-week-selector");
    var notesEl = document.getElementById("payment-notes");
    var taxNotesEl = document.getElementById("tax-notes");
    var refIdEl = document.getElementById("contract-ref-id");
    
    var totalAmount = 0;
    var products = [];
    
    document.querySelectorAll(".js-product-item").forEach(function(card) {
      var productName = card.querySelector(".item-name").textContent;
      var qty = parseInt(card.getAttribute("data-qty"));
      var basePrice = parseInt(card.getAttribute("data-base-price"));
      var currentTotal = parseFloat(card.getAttribute("data-current-total") || (basePrice * qty));
      var pctDiscount = parseFloat(card.querySelector(".js-item-pct").value) || 0;
      var fixedDiscount = parseFloat(card.querySelector(".js-item-fixed").value) || 0;
      var itemNotes = card.querySelector(".item-notes") ? card.querySelector(".item-notes").value : "";
      
      var productImage = card.getAttribute("data-image") || "";
      if (!productImage) {
        var imgEl = card.querySelector(".img-area img");
        productImage = imgEl ? imgEl.src : "";
      }
      
      totalAmount += currentTotal;
      products.push({
        name: productName,
        quantity: qty,
        base_price: basePrice,
        final_price: currentTotal,
        pct_discount: pctDiscount,
        fixed_discount: fixedDiscount,
        notes: itemNotes,
        image: productImage
      });
    });
    
    return {
      customer_name: clientNameInp ? clientNameInp.value : "",
      phone: formatPhoneNumber(phoneInp ? phoneInp.value : ""),
      address: addressEl ? addressEl.value : "",
      sales_rep: repEl ? repEl.value : "",
      delivery_week: deliveryEl ? deliveryEl.value : "",
      payment_notes: notesEl ? notesEl.value : "",
      tax_notes: taxNotesEl ? taxNotesEl.value : "",
      ref_id: refIdEl ? refIdEl.value : "",
      total_amount: totalAmount / 100,
      products: products
    };
  }

  function loadContractById(contractId) {
    var loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) loadingOverlay.classList.add("show");
    
    fetch(API_URL + "?action=list")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var contracts = Array.isArray(data) ? data : (data.contracts || []);
        var contract = contracts.find(function(c) {
          return String(c.id) === String(contractId) || String(c.ID) === String(contractId);
        });
        
        if (contract) {
          currentContractData = contract;
          fillFormWithContract(contract);
        } else {
          alert("Contract not found!");
          window.location.href = "/cart?view=contracts";
        }
        
        if (loadingOverlay) loadingOverlay.classList.remove("show");
      })
      .catch(function(err) {
        console.error("Error loading contract:", err);
        alert("Error loading contract!");
        if (loadingOverlay) loadingOverlay.classList.remove("show");
      });
  }

  function fillFormWithContract(contract) {
    currentContractId = contract.id || contract.ID;
    
    console.log("Loading contract ID:", currentContractId);
    
    var status = (contract.status || "").toLowerCase();
    if (status === "approved" || status === "onaylandi" || status === "onaylandı") {
      isViewMode = true;
      document.getElementById("contract-wrapper").classList.add("read-only");
      document.getElementById("view-mode-banner").classList.add("show");
      document.getElementById("approve-bar").style.display = "none";
      var saveBtn = document.getElementById("save-btn");
      if (saveBtn) saveBtn.style.display = "none";
    }
    
    var clientNameEl = document.getElementById("client-name");
    var clientPhoneEl = document.getElementById("client-phone");
    var clientAddressEl = document.getElementById("client-address");
    var salesRepEl = document.getElementById("sales-rep-select");
    var deliveryEl = document.getElementById("delivery-week-selector");
    var paymentNotesEl = document.getElementById("payment-notes");
    var taxNotesEl = document.getElementById("tax-notes");
    var refIdEl = document.getElementById("contract-ref-id");
    
    if (clientNameEl) clientNameEl.value = contract.customer_name || contract.customer || "";
    if (clientPhoneEl) clientPhoneEl.value = contract.phone || "";
    if (clientAddressEl) clientAddressEl.value = contract.address || "";
    if (paymentNotesEl) paymentNotesEl.value = contract.payment_notes || "";
    if (taxNotesEl) taxNotesEl.value = contract.tax_notes || "";
    if (refIdEl) refIdEl.value = contract.ref_id || currentContractId || "";
    
    if (salesRepEl && contract.sales_rep) {
      for (var i = 0; i < salesRepEl.options.length; i++) {
        if (salesRepEl.options[i].value === contract.sales_rep) {
          salesRepEl.selectedIndex = i;
          break;
        }
      }
    }
    
    if (deliveryEl && contract.delivery_week) {
      setTimeout(function() {
        for (var i = 0; i < deliveryEl.options.length; i++) {
          if (deliveryEl.options[i].value === contract.delivery_week) {
            deliveryEl.selectedIndex = i;
            break;
          }
        }
      }, 500);
    }
    
    var products = contract.products;
    if (typeof products === "string") {
      try { products = JSON.parse(products); } catch(e) { products = []; }
    }
    
    if (products && products.length > 0) {
      renderProducts(products, isViewMode);
      
      var totalArea = document.querySelector(".js-total-area");
      if (totalArea) {
        var total = products.reduce(function(sum, p) {
          return sum + (p.final_price || p.base_price * p.quantity || 0);
        }, 0);
        totalArea.setAttribute("data-base-total", total);
      }
    }
  }

  window.saveContractDraft = function() {
    var repEl = document.getElementById("sales-rep-select");
    var clientNameInp = document.getElementById("client-name");
    
    if (!repEl || !repEl.value) {
      alert("Please select a Sales Representative!");
      return;
    }
    
    if (!clientNameInp || !clientNameInp.value) {
      alert("Please enter Customer Name!");
      return;
    }
    
    var saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
      saveBtn.innerHTML = "SAVING...";
      saveBtn.disabled = true;
    }
    
    var contractData = getContractData();
    
    if (currentContractId) {
      contractData.action = "update";
      contractData.id = currentContractId;
    } else {
      contractData.action = "save";
    }
    
    console.log("Saving contract:", contractData);
    
    postToAPI(contractData)
    .then(function(result) {
      console.log("Save result:", result);
      if (result.success || result.id || result.updated) {
        if (currentContractId) {
          alert("Contract updated successfully!");
        } else {
          alert("Contract saved successfully!");
          if (result.id) {
            currentContractId = result.id;
          }
        }
        if (saveBtn) {
          saveBtn.innerHTML = "SAVED!";
          setTimeout(function() {
            saveBtn.innerHTML = "SAVE";
            saveBtn.disabled = false;
          }, 1500);
        }
      } else {
        alert("Error: " + (result.error || "Unknown error"));
        if (saveBtn) {
          saveBtn.innerHTML = "SAVE";
          saveBtn.disabled = false;
        }
      }
    })
    .catch(function(error) {
      console.error("Save error:", error);
      alert("Save failed! Error: " + error.message);
      if (saveBtn) {
        saveBtn.innerHTML = "SAVE";
        saveBtn.disabled = false;
      }
    });
  };

  window.handleSaleApproval = function() {
    var repEl = document.getElementById("sales-rep-select");
    var phoneInp = document.getElementById("client-phone");
    var clientNameInp = document.getElementById("client-name");
    var phoneCont = document.getElementById("phone-container");
    var successOverlay = document.getElementById("success-overlay");
    
    var hasError = false;
    
    if (repEl) repEl.classList.remove("error-flash");
    if (phoneCont) phoneCont.classList.remove("error-flash");
    
    if (!repEl || !repEl.value) {
      if (repEl) repEl.classList.add("error-flash");
      hasError = true;
    }
    
    if (!phoneInp || !phoneInp.value || phoneInp.value.length < 5) {
      if (phoneCont) phoneCont.classList.add("error-flash");
      hasError = true;
    }
    
    if (!clientNameInp || !clientNameInp.value) {
      hasError = true;
    }
    
    if (hasError) {
      alert("Please fill in all required fields: Sales Rep, Customer Name, and Phone Number.");
      return;
    }
    
    var approveBtn = document.querySelector(".btn-approve");
    var originalText = approveBtn ? approveBtn.innerHTML : "";
    if (approveBtn) {
      approveBtn.innerHTML = "PROCESSING...";
      approveBtn.disabled = true;
    }
    
    var contractData = getContractData();
    
    if (currentContractId) {
      contractData.action = "update";
      contractData.id = currentContractId;
    } else {
      contractData.action = "save";
    }
    
    postToAPI(contractData)
    .then(function(saveResult) {
      var savedId = saveResult.id || currentContractId;
      currentContractId = savedId;
      
      return postToAPI({
        action: "approve",
        id: savedId
      });
    })
    .then(function() {
      var orderNote = "APPROVED - Sales Rep: " + contractData.sales_rep + " - Customer: " + contractData.customer_name + " - Phone: " + contractData.phone + " - Total: " + formatMoney(contractData.total_amount * 100);
      
      return fetch("/cart/update.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: orderNote })
      });
    })
    .then(function() {
      var smsData = {
        phone: contractData.phone,
        customer_name: contractData.customer_name,
        sales_rep: contractData.sales_rep,
        total_amount: formatMoney(contractData.total_amount * 100),
        products: contractData.products,
        timestamp: new Date().toISOString()
      };
      
      fetch(ZAPIER_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smsData)
      });
      
      if (successOverlay) {
        successOverlay.style.display = "block";
      }
      
      setTimeout(function() {
        if (successOverlay) {
          successOverlay.style.display = "none";
        }
        window.location.href = "/cart?view=contracts";
      }, 2500);
    })
    .catch(function(error) {
      console.error("Error:", error);
      alert("An error occurred: " + error.message);
      if (approveBtn) {
        approveBtn.innerHTML = originalText;
        approveBtn.disabled = false;
      }
    });
  };

  function initPage() {
    var ms = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var sel = document.getElementById("delivery-week-selector");
    if(sel && sel.options.length <= 1) {
      var n = new Date(); 
      var cy = n.getFullYear(); 
      var cm = n.getMonth();
      for (var i = 0; i < 12; i++) {
        var mi = (cm + i) % 12; 
        var yr = cy + Math.floor((cm + i) / 12);
        var g = document.createElement("optgroup"); 
        g.label = ms[mi] + " " + yr;
        for (var w = 1; w <= 4; w++) {
          var o = document.createElement("option"); 
          o.value = o.textContent = ms[mi] + " Week " + w + ", " + yr;
          g.appendChild(o);
        }
        sel.appendChild(g);
      }
    }

    initProductEvents();

    var total10 = document.querySelector(".js-total-10");
    var totalPct = document.querySelector(".js-total-pct");
    var totalReset = document.querySelector(".js-reset-total");
    
    if(total10) total10.onclick = function() {
      totalPct.value = 10;
      recalcTotal();
    };
    
    if(totalPct) totalPct.oninput = function() {
      recalcTotal();
    };
    
    if(totalReset) totalReset.onclick = function() {
      totalPct.value = "";
      recalcTotal();
    };

    recalcTotal();
    
    var contractId = getUrlParam("id");
    if (contractId) {
      loadContractById(contractId);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();