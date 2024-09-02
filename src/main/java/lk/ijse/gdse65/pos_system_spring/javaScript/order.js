const loadAllCustomerCode = () => {
    $('#customer_id').empty();
    $('#customer_id').append("<option selected>Select customer code</option>");

    $.ajax({
        url: "http://localhost:8080/POS_system_spring_war_exploded/api/v1/customer",
        method: "GET",
        processData: false,
        contentType: false,
        success: function (resp) {
            console.log(resp);
            for (const customer of resp) {
                let option = `<option data-name="${customer.name}">${customer.customer_id}</option>;`
                $("#customer_id").append(option);
            }
        },
        error: function (xhr, exception) {
            console.log("Error loading customer codes:", exception);
        }
    });
}

$('#customer_id').change((e) => {
    const customer_id = e.target.value;
    if ('Select customer code' !== customer_id) {
        const name = e.target.options[e.target.selectedIndex].dataset.name;
        const qty = e.target.options[e.target.selectedIndex].dataset.qty;

        $('#customer_name').val(name);
        // $('#customer_qty').val(qty);
    }
})



const loadAllItemCode = () => {
    $('#order_item_id').empty();
    $('#order_item_id').append("<option selected>Select item code</option>");

    $.ajax({
        url: "http://localhost:8080/POS_system_spring_war_exploded/api/v1/item",
        method: "GET",
        processData: false,
        contentType: false,
        success: function (resp) {
            console.log(resp);
            for (const item of resp) {
                let option = `<option data-description="${item.description}" data-unitPrice="${item.unitPrice}" data-qty="${item.qty}">${item.item_code}</option>;`

                $("#order_item_id").append(option);
            }
        },
        error: function (xhr, exception) {
            console.log("Error loading item codes:", exception);
        }
    });
}

$('#order_item_id').change((e) => {
    const order_item_id = e.target.value;
    if ('Select item code' !== order_item_id) {
        const description = e.target.options[e.target.selectedIndex].getAttribute('data-description');
        $('#description').val(description);

        const unitPrice = e.target.options[e.target.selectedIndex].getAttribute('data-unitPrice');
        $('#unit_price').val(unitPrice);

        const qty = e.target.options[e.target.selectedIndex].getAttribute('data-qty');
        $('#qty_on_hand').val(qty);
    }
})
loadAllItemCode();
loadAllCustomerCode();


$("#add_cart").click(function () {
    updateTotal();
});
$("#unit_price, #qty_on_hand").on("input", updateTotal);


let itemsArray = [
    { item_id: '1', description: 'Item 1', qty: 10, item_price: 5.00 },
];

function loadItemData() {

}

function updateTotal() {
    const unitPrice = parseFloat($("#unit_price").val()) || 0;
    const quantity = parseInt($("#order_qty").val()) || 0;
    const total = (unitPrice * quantity);
    $("#final_total").val(total.toFixed(2));
    return total;
}

function addToCart() {
    let item_id = $('#order_item_id option:selected').text();
    let itemExists = false;

    $('#order_table_body .item_id').each(function () {
        if ($(this).text() === item_id) {
            itemExists = true;
            let existingQty = parseInt($(this).closest('tr').find('.qty').text());
            let qty = parseInt($('#order_qty').val());
            let newQty = existingQty + qty;

            let existingTotal = parseFloat($(this).closest('tr').find('.total').text());
            let add_total = updateTotal(); // Update the total and return it
            let newTotal = existingTotal + add_total;

            let selectedItem = itemsArray.find(item => item.item_id === item_id);

            if (selectedItem) {
                if (selectedItem.qty < qty) {
                    toastr.error('Error: Not enough items in stock.');
                    return;
                } else {
                    selectedItem.qty -= qty;
                    $(this).closest('tr').find('.qty').text(newQty);
                    $(this).closest('tr').find('.total').text(newTotal.toFixed(2));
                    loadItemData();
                }
            }

            return false;
        }
    });

    if (!itemExists) {
        console.log('Item with ID ' + item_id + ' is not in the table.');

        let desc = $('#description').val();
        let total = updateTotal();
        let qty = $('#order_qty').val();

        let selectedItem = itemsArray.find(item => item.item_id === item_id);

        if (selectedItem) {
            if (selectedItem.qty < qty) {
                toastr.error('Error: Not enough items in stock.');
                return;
            } else {
                selectedItem.qty -= parseInt(qty);
                loadItemData();
            }
        }

        let record = `<tr><td class="item_id">${item_id}</td><td class="desc">${desc}</td><td class="qty">${qty}</td><td class="total">${total.toFixed(2)}</td></tr>;`
        $("#order_table_body").append(record);

        toastr.success("Add to cart...🛒");
    } else {
        console.log('Item not found in itemsArray.');
    }
    callMethod();

    $('#description').val('');
    $('#unit_price').val('');
    $('#qty_on_hand').val('');
    $('#order_qty').val('');

    function updateTotal() {
        const unitPrice = parseFloat($("#unit_price").val()) || 0;
        const quantity = parseInt($("#order_qty").val()) || 0;
        const total = (unitPrice * quantity);
        $("#final_total").val(total.toFixed(2));
        return total;
    }
}
$('#add_cart').on('click', addToCart);

function callMethod() {
    $("#order_table_body > tr").click(function () {
        let item_id = $(this).find('.item_id').text();
        let desc = $(this).find('.desc').text();
        let qty = $(this).find('.qty').text();
        let total = $(this).find('.total').text();

        $("#order_item_id").val(item_id);
        $("#description").val(desc);
        $("#order_qty").val(qty);
        $("#unit_price").val(total/qty);

    });
}
$("#remove").click(function () {
    let selectedItemId = $('#order_item_id').val();

    $('#order_item_id').val('');
    $('#description').val('');
    $('#unit_price').val('');
    $('#qty_on_hand').val('');
    $('#order_qty').val('');
    $('#final_total').val('');

    $("#order_table_body tr").each(function () {
        if ($(this).find('.item_id').text() === selectedItemId) {
            $(this).remove();
            return false;
        }
    });
});

$("#place_ord").click(function () {

    let formData = new FormData();
    formData.append("order_id", $("#order_id").val());
    formData.append("customer_id", $("#customer_id").val());
    formData.append("customer_name", $("#customer_name").val());
    formData.append("order_item_id", $("#order_item_id").val());
    formData.append("description", $("#description").val());
    formData.append("total", $("#final_total").val());

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/POS_system_spring_war_exploded/api/v1/order",
        async: true,
        processData: false,
        contentType: false,
        data: formData,
        success: function (data) {
            reset();
            alert("Order saved successfully.");
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
});

const loadAllOrders = () => {
    $("#place-tbl-body").empty();
    $.ajax({
        url: "http://localhost:8080/POS_system_spring_war_exploded/api/v1/order",
        method: "GET",
        dataType: "json",
        success: function (resp) {
            console.log(resp);
            for (const order of resp) {
                let row = `<tr><td>${order.order_id}</td><td>${order.customer_id}</td><td>${order.customer_name}</td><td>${order.order_item_id}</td><td>${order.description}</td><td>${order.total}</td></tr>;`
                $("#place-tbl-body").append(row);
            }
            callMethod()
        }
    });
}
$("#detail_nav").click(function () {
    loadAllOrders();
});
