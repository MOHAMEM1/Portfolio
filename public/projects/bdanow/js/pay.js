// ================================================================
// BDANOW - Payment Application Engine
// ================================================================
// Handles Stripe and PayPal integrations

(function () {
    'use strict';

    const paymentApp = {
        checkoutData: null,
        currentUser: null,
        cart: [],
        totalAmount: 0,
        selectedMethod: 'credit-card',
        isProcessing: false,
        stripe: null,
        cardElement: null,

        // DOM Elements
        elements: {
            emptyCart: document.getElementById('emptyCart'),
            paymentContent: document.getElementById('paymentContent'),
            cartItems: document.getElementById('cartItems'),
            subtotal: document.getElementById('subtotal'),
            serviceFee: document.getElementById('serviceFee'),
            taxes: document.getElementById('taxes'),
            totalAmount: document.getElementById('totalAmount'),
            userAvatar: document.getElementById('userAvatar'),
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            payButton: document.getElementById('payButton'),
            payButtonText: document.getElementById('payButtonText'),
            payButtonAmount: document.getElementById('payButtonAmount'),
            successModal: document.getElementById('successModal'),
            transactionId: document.getElementById('transactionId'),
            closeModal: document.getElementById('closeModal'),
            methodTabs: document.querySelectorAll('.method-tab'),
            creditCardForm: document.getElementById('creditCardForm'),
            paypalForm: document.getElementById('paypal-form')
        },

        // Initialize payment page
        init() {
            this.loadCheckoutData();
            if (this.cart.length === 0) return;
            
            this.renderCart();
            this.calculateTotals();
            this.setupEventListeners();
            this.initStripe();
            this.initPayPal();
        },

        // Load checkout data from localStorage
        loadCheckoutData() {
            const savedData = localStorage.getItem('checkoutData') || localStorage.getItem('bdanow-checkout');
            if (!savedData) {
                this.showEmptyCart();
                return;
            }

            try {
                this.checkoutData = JSON.parse(savedData);
                this.cart = this.checkoutData.cart || [];
                this.currentUser = this.checkoutData.user || null;

                if (this.cart.length === 0) {
                    this.showEmptyCart();
                } else {
                    this.showPaymentContent();
                    this.updateUserInfo();
                }
            } catch (error) {
                console.error('Error loading checkout data:', error);
                this.showEmptyCart();
            }
        },

        showEmptyCart() {
            if(this.elements.emptyCart) this.elements.emptyCart.classList.remove('hidden');
            if(this.elements.paymentContent) this.elements.paymentContent.classList.add('hidden');
        },

        showPaymentContent() {
            if(this.elements.emptyCart) this.elements.emptyCart.classList.add('hidden');
            if(this.elements.paymentContent) this.elements.paymentContent.classList.remove('hidden');
        },

        updateUserInfo() {
            if (this.currentUser) {
                if(this.elements.userName) this.elements.userName.textContent = this.currentUser.name || 'Utilisateur';
                if(this.elements.userEmail) this.elements.userEmail.textContent = this.currentUser.email || 'Non spécifié';
                if (this.currentUser.avatar && this.elements.userAvatar) {
                    this.elements.userAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">`;
                }
            }
        },

        renderCart() {
            if (!this.elements.cartItems) return;
            this.elements.cartItems.innerHTML = '';
            
            this.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'payment-cart-item';
                cartItem.innerHTML = `
                    <div class="payment-cart-item-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="payment-cart-item-details">
                        <div class="payment-cart-item-title">${item.title}</div>
                        <div class="payment-cart-item-price">${this.formatPrice(item.price)} DH</div>
                    </div>
                `;
                this.elements.cartItems.appendChild(cartItem);
            });
        },

        calculateTotals() {
            const subtotal = this.cart.reduce((sum, item) => sum + item.price, 0);
            const serviceFee = subtotal * 0.02;
            const taxes = subtotal * 0.20;
            const total = subtotal + serviceFee + taxes;
            
            this.totalAmount = total;
            
            if(this.elements.subtotal) this.elements.subtotal.textContent = this.formatPrice(subtotal) + ' DH';
            if(this.elements.serviceFee) this.elements.serviceFee.textContent = this.formatPrice(serviceFee) + ' DH';
            if(this.elements.taxes) this.elements.taxes.textContent = this.formatPrice(taxes) + ' DH';
            if(this.elements.totalAmount) this.elements.totalAmount.textContent = this.formatPrice(total) + ' DH';
            if(this.elements.payButtonAmount) this.elements.payButtonAmount.textContent = this.formatPrice(total) + ' DH';
        },

        formatPrice(price) {
            return price.toLocaleString('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        setupEventListeners() {
            this.elements.methodTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const method = e.currentTarget.dataset.method;
                    this.selectPaymentMethod(method);
                });
            });

            if(this.elements.payButton) {
                this.elements.payButton.addEventListener('click', () => {
                    if (this.selectedMethod === 'credit-card') {
                        this.processStripePayment();
                    }
                });
            }

            if(this.elements.closeModal) {
                this.elements.closeModal.addEventListener('click', () => {
                    this.closeSuccessModal();
                });
            }

            if(this.elements.successModal) {
                this.elements.successModal.addEventListener('click', (e) => {
                    if (e.target === this.elements.successModal) {
                        this.closeSuccessModal();
                    }
                });
            }
        },

        selectPaymentMethod(method) {
            this.selectedMethod = method;
            this.elements.methodTabs.forEach(tab => {
                tab.classList.toggle('active', tab.dataset.method === method);
            });
            
            if (method === 'credit-card') {
                if(this.elements.creditCardForm) this.elements.creditCardForm.classList.add('active');
                if(this.elements.paypalForm) this.elements.paypalForm.classList.remove('active');
            } else if (method === 'paypal') {
                if(this.elements.creditCardForm) this.elements.creditCardForm.classList.remove('active');
                if(this.elements.paypalForm) this.elements.paypalForm.classList.add('active');
            }
        },

        initStripe() {
            if (typeof Stripe === 'undefined') {
                console.warn('Stripe is not loaded');
                return;
            }
            
            //  Replace with your real Stripe publishable key
            this.stripe = Stripe('pk_test_your_stripe_publishable_key');
            const elements = this.stripe.elements();
            
            const rootStyles = getComputedStyle(document.documentElement);
            const textColor = rootStyles.getPropertyValue('--text-primary').trim() || '#333';
            
            this.cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: textColor,
                        '::placeholder': {
                            color: '#94a3b8',
                        },
                    },
                    invalid: {
                        color: '#ef4444',
                    },
                },
            });
            
            if (document.getElementById('card-element')) {
                this.cardElement.mount('#card-element');
            }
        },

        initPayPal() {
            if (typeof paypal === 'undefined') {
                console.warn('PayPal is not loaded');
                return;
            }

            //  Replace YOUR_PAYPAL_CLIENT_ID in script tag in HTML
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: (this.totalAmount).toFixed(2),
                                currency_code: 'MAD'
                            },
                            description: 'Paiement BDANOW formations'
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then(details => {
                        this.handlePaymentSuccess();
                    });
                },
                onError: (err) => {
                    this.showNotification('Erreur PayPal : ' + err.message, 'error');
                    this.isProcessing = false;
                }
            }).render('#paypal-button-container');
        },

        async processStripePayment() {
            if (this.isProcessing) return;
            
            const cardNameInput = document.getElementById('cardName');
            const cardName = cardNameInput ? cardNameInput.value.trim() : '';
            
            if (!cardName) {
                this.showNotification('Veuillez entrer le nom sur la carte', 'warning');
                return;
            }
            
            this.isProcessing = true;
            this.showProcessing(true);
            
            try {
                const { error, paymentMethod } = await this.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.cardElement,
                    billing_details: { name: cardName }
                });
                
                if (error) {
                    this.showNotification(error.message, 'warning');
                    this.isProcessing = false;
                    this.showProcessing(false);
                    return;
                }
                
                //  In real app: send paymentMethod.id to your backend to confirm payment
                // For demo, treat as success
                this.handlePaymentSuccess();
                
            } catch (err) {
                this.showNotification('Erreur inattendue', 'error');
                this.isProcessing = false;
                this.showProcessing(false);
            }
        },

        handlePaymentSuccess() {
            const transactionId = 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            if(this.elements.transactionId) {
                this.elements.transactionId.innerHTML = `Transaction: <strong>#${transactionId}</strong>`;
            }
            
            this.saveTransaction(transactionId);
            this.clearCart();
            this.showSuccessModal();
            this.isProcessing = false;
            this.showProcessing(false);
        },

        saveTransaction(transactionId) {
            const transaction = {
                id: transactionId,
                date: new Date().toISOString(),
                amount: this.totalAmount,
                items: this.cart,
                method: this.selectedMethod,
                user: this.currentUser
            };
            
            const userTransactions = JSON.parse(localStorage.getItem('bdanow-transactions') || '[]');
            userTransactions.push(transaction);
            localStorage.setItem('bdanow-transactions', JSON.stringify(userTransactions));
            
            // Add courses to user dashboard
            const userCourses = JSON.parse(localStorage.getItem('bdanow-user-courses') || '[]');
            this.cart.forEach(item => {
                if (!userCourses.some(c => c.id === item.id)) {
                    userCourses.push({
                        ...item,
                        progress: 0,
                        lastAccessed: new Date().toISOString().split('T')[0]
                    });
                }
            });
            localStorage.setItem('bdanow-user-courses', JSON.stringify(userCourses));
        },

        clearCart() {
            try {
                localStorage.removeItem('checkoutData');
                localStorage.removeItem('bdanow-checkout');
                localStorage.setItem('bdanow-cart', '[]');
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        },

        showProcessing(isProcessing) {
            if(!this.elements.payButton) return;
            
            if (isProcessing) {
                this.elements.payButton.disabled = true;
                if(this.elements.payButtonText) this.elements.payButtonText.innerHTML = '<span class="spinner"></span> Traitement...';
            } else {
                this.elements.payButton.disabled = false;
                if(this.elements.payButtonText) this.elements.payButtonText.textContent = 'Payer maintenant';
            }
        },

        showSuccessModal() {
            if(this.elements.successModal) this.elements.successModal.classList.add('active');
        },

        closeSuccessModal() {
            if(this.elements.successModal) {
                this.elements.successModal.classList.remove('active');
                setTimeout(() => {
                    window.location.href = 'index.html#dashboard';
                }, 300);
            }
        },

        showNotification(message, type = 'success') {
            const existing = document.querySelector('.notification');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#EF4444'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 300px;
            `;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button style="margin-left: auto; background: none; border: none; color: white; cursor: pointer;">&times;</button>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    notification.style.transform = 'translateX(0)';
                });
            });
            
            // Auto remove
            const timeout = setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
            
            // Manual remove
            notification.querySelector('button').addEventListener('click', () => {
                clearTimeout(timeout);
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => paymentApp.init());
    } else {
        paymentApp.init();
    }

})();
