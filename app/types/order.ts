export interface Order {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string;
  checkout_id: number;
  checkout_token: string;
  client_details: ClientDetails;
  closed_at: string | null;
  company: string | null;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: PriceSet;
  current_total_additional_fees_set: any | null;
  current_total_discounts: string;
  current_total_discounts_set: PriceSet;
  current_total_duties_set: any | null;
  current_total_price: string;
  current_total_price_set: PriceSet;
  current_total_tax: string;
  current_total_tax_set: PriceSet;
  customer_locale: string;
  device_id: string | null;
  discount_codes: any[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: string | null;
  landing_site: string;
  landing_site_ref: string | null;
  location_id: number | null;
  merchant_of_record_app_id: number | null;
  name: string;
  note: string | null;
  note_attributes: any[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_additional_fees_set: any | null;
  original_total_duties_set: any | null;
  payment_gateway_names: string[];
  phone: string | null;
  presentment_currency: string;
  processed_at: string;
  reference: string;
  referring_site: string;
  source_identifier: string;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  subtotal_price_set: PriceSet;
  tags: string;
  tax_lines: any[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: PriceSet;
  total_line_items_price: string;
  total_line_items_price_set: PriceSet;
  total_outstanding: string;
  total_price: string;
  total_price_set: PriceSet;
  total_shipping_price_set: PriceSet;
  total_tax: string;
  total_tax_set: PriceSet;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: Address;
  customer: Customer;
  discount_applications: any[];
  fulfillments: Fulfillment[];
  line_items: LineItem[];
  payment_terms: string | null;
  refunds: any[];
  shipping_address: Address;
  shipping_lines: ShippingLine[];
}

export interface ClientDetails {
  accept_language: string;
  browser_height: number | null;
  browser_ip: string;
  browser_width: number | null;
  session_hash: string | null;
  user_agent: string;
}

export interface PriceSet {
  shop_money: Money;
  presentment_money: Money;
}

export interface Money {
  amount: string;
  currency_code: string;
}

export interface Address {
  first_name: string;
  address1: string;
  phone: string | null;
  city: string;
  zip: string | null;
  province: string | null;
  country: string;
  last_name: string;
  address2: string | null;
  company: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
  country_code: string;
  province_code: string | null;
}

export interface Customer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  state: string;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  email_marketing_consent: Consent | null;
  sms_marketing_consent: Consent | null;
  tags: string;
  currency: string;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: Address;
}

export interface Consent {
  state: string;
  opt_in_level: string;
  consent_updated_at: string | null;
}

export interface LineItem {
  id: number;
  admin_graphql_api_id: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: PriceSet;
  product_exists: boolean;
  product_id: number;
  properties: any[];
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: PriceSet;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor: string;
  tax_lines: any[];
  duties: any[];
  discount_allocations: any[];
}

export interface ShippingLine {
  id: number;
  carrier_identifier: string;
  code: string;
  delivery_category: string | null;
  discounted_price: string;
  discounted_price_set: PriceSet;
  phone: string | null;
  price: string;
  price_set: PriceSet;
  requested_fulfillment_service_id: string | null;
  source: string;
  title: string;
  tax_lines: any[];
  discount_allocations: any[];
}

export interface MoneySet {
  shop_money: Money;
  presentment_money: Money;
}

export interface TaxLine {
  title: string;
  price: string;
  rate: number;
  price_set: MoneySet;
}

export interface Duty {
  id: string;
  harmonized_system_code: string;
  country_code_of_origin: string;
  shop_money: Money;
  presentment_money: Money;
  tax_lines: TaxLine[];
  admin_graphql_api_id: string;
}

export interface Fulfillment {
  created_at: string;
  id: number;
  line_items: LineItem[];
  location_id: number;
  name: string;
  notify_customer: boolean;
  order_id: number;
  origin_address: {
    address1: string;
    address2: string;
    city: string;
    country_code: string;
    province_code: string;
    zip: string;
  }[];
  receipt: {
    testcase: boolean;
    authorization: string;
  };
  service: string;
  shipment_status: string;
  status: string;
  tracking_company: string;
  tracking_numbers: string[];
  tracking_number: string;
  tracking_urls: string[];
  tracking_url: string;
  updated_at: string;
  variant_inventory_management: string;
}
