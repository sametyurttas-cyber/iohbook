alter type public.order_status rename value 'fulfillment' to 'fulfilled';

comment on type public.order_status is
  'Order lifecycle: draft -> pending_payment -> paid -> fulfilled -> completed, with cancelled/refunded exits.';
