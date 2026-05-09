import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface OrderDetails {
  _id: string;
  userId: string;
  emailAddress: string;
  quantity: number;
  totalPrice: number;
  transactionId: string;
  paymentStatus: string;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    brand?: string;
    category: string;
  };
}

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendPaymentConfirmationEmail(orderDetails: OrderDetails): Promise<void> {
    const htmlContent = this.generateOrderConfirmationHtml(orderDetails);

    try {
      await this.resend.emails.send({
        from: this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@ecommerce.com',
        to: orderDetails.emailAddress,
        subject: `Order Confirmation - Order #${orderDetails._id}`,
        html: htmlContent,
      });

      console.log(
        `Payment confirmation email sent to ${orderDetails.emailAddress} for order ${orderDetails._id}`,
      );
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
      throw error;
    }
  }

  private generateOrderConfirmationHtml(orderDetails: OrderDetails): string {
    const { product, totalPrice, quantity, transactionId, _id } = orderDetails;
    const discountedPrice = product.price * quantity;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
          }
          .product-info {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .product-header {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
          }
          .product-image {
            width: 80px;
            height: 80px;
            background: #e0e0e0;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #999;
            flex-shrink: 0;
          }
          .product-details {
            flex: 1;
          }
          .product-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }
          .product-brand {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
          }
          .product-category {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .product-description {
            font-size: 13px;
            color: #555;
            line-height: 1.5;
            margin-top: 12px;
          }
          .order-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .detail-item {
            text-align: left;
          }
          .detail-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 16px;
            color: #333;
            font-weight: 600;
          }
          .price-breakdown {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          .price-row.total {
            border-top: 2px solid #ddd;
            padding-top: 12px;
            font-size: 18px;
            font-weight: 700;
            color: #667eea;
          }
          .price-label {
            color: #666;
          }
          .price-value {
            color: #333;
            font-weight: 600;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          .footer-text {
            font-size: 12px;
            color: #999;
            line-height: 1.6;
          }
          .success-badge {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .transaction-id {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .transaction-id-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .transaction-id-value {
            font-size: 14px;
            color: #333;
            font-family: 'Courier New', monospace;
            word-break: break-all;
          }
          .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>✓ Payment Confirmed</h1>
            <p>Thank you for your purchase!</p>
          </div>

          <!-- Main Content -->
          <div class="content">
            <!-- Success Badge -->
            <div style="text-align: center;">
              <div class="success-badge">Order Successfully Placed</div>
            </div>

            <!-- Order Number Section -->
            <div class="section">
              <div class="section-title">Order Details</div>
              <div class="order-details-grid">
                <div class="detail-item">
                  <div class="detail-label">Order Number</div>
                  <div class="detail-value">#${_id.toString().substring(0, 8).toUpperCase()}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Order Date</div>
                  <div class="detail-value">${formattedDate}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Order Status</div>
                  <div class="detail-value" style="color: #4caf50;">Confirmed</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Quantity</div>
                  <div class="detail-value">${quantity} item${quantity > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            <!-- Transaction ID -->
            <div class="transaction-id">
              <div class="transaction-id-label">Transaction ID</div>
              <div class="transaction-id-value">${transactionId}</div>
            </div>

            <div class="divider"></div>

            <!-- Product Information -->
            <div class="section">
              <div class="section-title">Product Information</div>
              <div class="product-info">
                <div class="product-header">
                  <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : '[Image]'}
                  </div>
                  <div class="product-details">
                    <div class="product-name">${product.name}</div>
                    ${product.brand ? `<div class="product-brand">Brand: ${product.brand}</div>` : ''}
                    <div class="product-category">${product.category}</div>
                    ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Price Breakdown -->
            <div class="section">
              <div class="section-title">Price Breakdown</div>
              <div class="price-breakdown">
                <div class="price-row">
                  <span class="price-label">Unit Price:</span>
                  <span class="price-value">Rs. ${product.price.toLocaleString()}</span>
                </div>
                <div class="price-row">
                  <span class="price-label">Quantity:</span>
                  <span class="price-value">× ${quantity}</span>
                </div>
                <div class="price-row">
                  <span class="price-label">Subtotal:</span>
                  <span class="price-value">Rs. ${discountedPrice.toLocaleString()}</span>
                </div>
                <div class="price-row total">
                  <span>Total Amount</span>
                  <span>Rs. ${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Next Steps -->
            <div class="section">
              <div class="section-title">What's Next?</div>
              <div style="font-size: 14px; color: #555; line-height: 1.8;">
                <p>📦 Your order is being prepared for shipment.</p>
                <p>🚚 You will receive a shipping notification once your order is dispatched.</p>
                <p>👀 Track your order status anytime by logging into your account.</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">
              <p>If you have any questions about your order, please contact our customer support team.</p>
              <p style="margin-top: 10px; color: #bbb;">© 2026 E-Commerce Store. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
