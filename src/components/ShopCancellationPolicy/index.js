const ShopCancellationPolicyText = ({ inModal = false }) => (
  <div
    className={`space-y-5 leading-relaxed ${inModal ? 'text-sm' : 'text-sm'}`}
  >
    <h3 className={`font-bold ${inModal ? 'text-lg' : 'text-base'}`}>
      Living Pupil Bookshop Cancellation & Order Policy
    </h3>
    <p>
      Please read this policy carefully before placing an order in the Living
      Pupil Homeschool Bookshop. By agreeing, you acknowledge that you understand
      and accept these terms.
    </p>
    <ol className="px-5 space-y-4 list-decimal">
      <li>
        <strong>ORDER CONFIRMATION.</strong> An order is considered placed once
        checkout is completed in the Parent Portal / Shop. You will receive order
        and invoice details via email when applicable.
      </li>
      <li>
        <strong>PAYMENT POLICY.</strong> Only paid orders will be processed. If
        payment is not completed within twenty-four (24) hours from order
        placement, the school may automatically cancel the order and release any
        reserved inventory.
      </li>
      <li>
        <strong>INSTALLMENT ORDERS.</strong> For installment purchases, the first
        required payment (including shipping when applicable) must be settled for
        the order to proceed. Subsequent installment schedules and due dates are
        indicated in your invoice and order emails.
      </li>
      <li>
        <strong>CANCELLATION BEFORE FULFILLMENT.</strong> Parents may request
        cancellation of an unpaid or unfulfilled order by contacting Living Pupil
        Homeschool administration. Approved cancellations will release reserved
        stock. Refunds for payments already made, if any, are subject to school
        finance review and applicable processing times.
      </li>
      <li>
        <strong>NON-CANCELLABLE / NON-RETURNABLE ITEMS.</strong> Learning
        materials, books, kits, and similar shop items that have already been
        packed, released, shipped, or otherwise made available are generally
        non-returnable and non-refundable, except where required by applicable
        law or expressly approved by the school.
      </li>
      <li>
        <strong>SHIPPING & PICK-UP.</strong> Shipping fees, delivery areas, and
        schedules are as selected at checkout. Delays caused by couriers, force
        majeure, or incomplete contact/delivery information are not the
        responsibility of Living Pupil Homeschool.
      </li>
      <li>
        <strong>STOCK AVAILABILITY.</strong> Items are subject to available
        inventory. The school reserves the right to cancel or adjust an order if
        an item becomes unavailable after checkout; in such cases, parents will
        be notified and guided on next steps.
      </li>
      <li>
        <strong>CONTACT.</strong> For cancellation or order concerns, email the
        Living Pupil Homeschool administration / shop support channels provided
        in your order confirmation.
      </li>
    </ol>
    <p>
      Living Pupil Homeschool reserves the right to amend this Bookshop
      Cancellation & Order Policy. Continued use of the shop after updates
      constitutes acceptance of the revised terms.
    </p>
    <p>
      <a
        href="/files/lp-shop-cancellation-policy.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline"
      >
        Download PDF copy of the bookshop cancellation policy
      </a>
    </p>
  </div>
);

export default ShopCancellationPolicyText;
