import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  // Contact form elements
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly commentInput: Locator;
  readonly sendMessageButton: Locator;

  // Contact information
  readonly contactInfoSection: Locator;
  readonly emailInfo: Locator;
  readonly phoneInfo: Locator;
  readonly businessHours: Locator;

  // Form validation
  readonly requiredFieldErrors: Locator;
  readonly nameError: Locator;
  readonly emailError: Locator;
  readonly commentError: Locator;

  // Success/Error messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  // Page elements
  readonly contactHeader: Locator;
  readonly contactSubtitle: Locator;
  readonly needHelpSection: Locator;
  readonly phoneNumber: Locator;

  constructor(page: Page) {
    super(page);
    
    // Contact form elements
    this.contactForm = page.locator('form');
    this.nameInput = page.getByPlaceholder('Name *');
    this.emailInput = page.getByPlaceholder('Email *');
    this.commentInput = page.getByPlaceholder('Comment or Message *');
    this.sendMessageButton = page.getByRole('button', { name: 'Send Message' });

    // Contact information
    this.contactInfoSection = page.locator('h3:has-text("You tell us. We listen.")');
    this.emailInfo = page.locator('text=hello@atid.store');
    this.phoneInfo = page.locator('text=972-52-1234567');
    this.businessHours = page.locator('text=Sunday to Thursday - 9:00 am to 7:00 pm');

    // Form validation
    this.requiredFieldErrors = page.locator('text=This field is required.');
    this.nameError = page.locator('text=Name * This field is required.');
    this.emailError = page.locator('text=Email * This field is required.');
    this.commentError = page.locator('text=Comment or Message * This field is required.');

    // Success/Error messages
    this.successMessage = page.locator('text=Thank you for your message');
    this.errorMessage = page.locator('text=Error sending message');

    // Page elements
    this.contactHeader = page.locator('h1:has-text("Contact Us")');
    this.contactSubtitle = page.locator('h3:has-text("Have any Queries?")');
    this.needHelpSection = page.locator('h4:has-text("Need Help?")');
    this.phoneNumber = page.locator('h3:has-text("972-52-1234567")');
  }

  /**
   * Navigate to contact page
   */
  async navigateToContact() {
    await this.goto('/contact-us/');
    await this.waitForPageLoad();
  }

  /**
   * Fill contact form
   */
  async fillContactForm(name: string, email: string, comment: string) {
    if (name) {
      await this.fillWithRetry(this.nameInput, name);
    }
    if (email) {
      await this.fillWithRetry(this.emailInput, email);
    }
    if (comment) {
      await this.fillWithRetry(this.commentInput, comment);
    }
  }

  /**
   * Submit contact form
   */
  async submitContactForm() {
    await this.clickWithRetry(this.sendMessageButton);
    await this.waitForPageLoad();
  }

  /**
   * Submit empty form to trigger validation
   */
  async submitEmptyForm() {
    await this.clickWithRetry(this.sendMessageButton);
    await this.waitForPageLoad();
  }

  /**
   * Get form field value
   */
  async getFormFieldValue(fieldName: string): Promise<string> {
    let field: Locator;
    
    switch (fieldName.toLowerCase()) {
      case 'name':
        field = this.nameInput;
        break;
      case 'email':
        field = this.emailInput;
        break;
      case 'comment':
        field = this.commentInput;
        break;
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }

    return await this.getElementAttribute(field, 'value') || '';
  }

  /**
   * Check if field has error
   */
  async hasFieldError(fieldName: string): Promise<boolean> {
    let errorLocator: Locator;
    
    switch (fieldName.toLowerCase()) {
      case 'name':
        errorLocator = this.nameError;
        break;
      case 'email':
        errorLocator = this.emailError;
        break;
      case 'comment':
        errorLocator = this.commentError;
        break;
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }

    return await this.isElementVisible(errorLocator);
  }

  /**
   * Get error message text
   */
  async getErrorMessageText(): Promise<string> {
    return await this.getElementText(this.requiredFieldErrors);
  }

  /**
   * Check if success message is displayed
   */
  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.successMessage);
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Get contact information
   */
  async getContactInformation(): Promise<{
    email: string;
    phone: string;
    businessHours: string;
  }> {
    const email = await this.getElementText(this.emailInfo);
    const phone = await this.getElementText(this.phoneInfo);
    const hours = await this.getElementText(this.businessHours);

    return {
      email: email.replace(/[^\w@.-]/g, ''), // Clean up email
      phone: phone.replace(/[^\d-]/g, ''), // Clean up phone
      businessHours: hours.trim()
    };
  }

  /**
   * Validate email format
   */
  async validateEmailFormat(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Test form with invalid email
   */
  async testInvalidEmail(invalidEmail: string) {
    await this.fillContactForm('Test User', invalidEmail, 'Test comment');
    await this.submitContactForm();
  }

  /**
   * Test form with empty required fields
   */
  async testEmptyRequiredFields() {
    await this.submitEmptyForm();
  }

  /**
   * Test form with valid data
   */
  async testValidFormSubmission(name: string, email: string, comment: string) {
    await this.fillContactForm(name, email, comment);
    await this.submitContactForm();
  }

  /**
   * Test form with special characters
   */
  async testSpecialCharacters() {
    const specialName = 'Test User <script>alert("XSS")</script>';
    const specialComment = 'Test comment with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    
    await this.fillContactForm(specialName, 'test@example.com', specialComment);
    await this.submitContactForm();
  }

  /**
   * Test form with very long input
   */
  async testLongInput() {
    const longName = 'A'.repeat(1000);
    const longEmail = 'test@example.com';
    const longComment = 'B'.repeat(2000);
    
    await this.fillContactForm(longName, longEmail, longComment);
    await this.submitContactForm();
  }

  /**
   * Verify contact page elements
   */
  async verifyContactPageElements() {
    await this.assertElementVisible(this.contactHeader, 'Contact header should be visible');
    await this.assertElementVisible(this.contactSubtitle, 'Contact subtitle should be visible');
    await this.assertElementVisible(this.contactForm, 'Contact form should be visible');
    await this.assertElementVisible(this.nameInput, 'Name input should be visible');
    await this.assertElementVisible(this.emailInput, 'Email input should be visible');
    await this.assertElementVisible(this.commentInput, 'Comment input should be visible');
    await this.assertElementVisible(this.sendMessageButton, 'Send message button should be visible');
  }

  /**
   * Verify contact information
   */
  async verifyContactInformation() {
    await this.assertElementVisible(this.contactInfoSection, 'Contact info section should be visible');
    await this.assertElementVisible(this.emailInfo, 'Email information should be visible');
    await this.assertElementVisible(this.phoneInfo, 'Phone information should be visible');
    await this.assertElementVisible(this.businessHours, 'Business hours should be visible');
    await this.assertElementVisible(this.needHelpSection, 'Need help section should be visible');
    await this.assertElementVisible(this.phoneNumber, 'Phone number should be visible');
  }

  /**
   * Verify form validation for empty fields
   */
  async verifyFormValidationEmptyFields() {
    await this.submitEmptyForm();
    
    // Check for required field errors
    await this.assertElementVisible(this.requiredFieldErrors, 'Required field errors should be visible');
    
    // Verify specific field errors
    const nameHasError = await this.hasFieldError('name');
    const emailHasError = await this.hasFieldError('email');
    const commentHasError = await this.hasFieldError('comment');
    
    if (!nameHasError || !emailHasError || !commentHasError) {
      throw new Error('All required fields should show validation errors when empty');
    }
  }

  /**
   * Verify form validation for invalid email
   */
  async verifyFormValidationInvalidEmail() {
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@example.com',
      'test..test@example.com',
      'test@example..com'
    ];

    for (const invalidEmail of invalidEmails) {
      await this.testInvalidEmail(invalidEmail);
      
      // Check if form shows validation error
      const hasEmailError = await this.hasFieldError('email');
      if (!hasEmailError) {
        throw new Error(`Email validation should fail for: ${invalidEmail}`);
      }
    }
  }

  /**
   * Verify form submission with valid data
   */
  async verifyFormSubmissionValidData() {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      comment: 'This is a test comment for automated testing.'
    };

    await this.testValidFormSubmission(testData.name, testData.email, testData.comment);
    
    // Verify form data was submitted correctly
    const submittedName = await this.getFormFieldValue('name');
    const submittedEmail = await this.getFormFieldValue('email');
    const submittedComment = await this.getFormFieldValue('comment');
    
    if (submittedName !== testData.name || 
        submittedEmail !== testData.email || 
        submittedComment !== testData.comment) {
      throw new Error('Form data should be submitted correctly');
    }
  }

  /**
   * Verify form handles special characters
   */
  async verifyFormHandlesSpecialCharacters() {
    await this.testSpecialCharacters();
    
    // Form should not break with special characters
    const isFormVisible = await this.isElementVisible(this.contactForm);
    if (!isFormVisible) {
      throw new Error('Form should remain functional with special characters');
    }
  }

  /**
   * Verify form handles long input
   */
  async verifyFormHandlesLongInput() {
    await this.testLongInput();
    
    // Form should handle long input gracefully
    const isFormVisible = await this.isElementVisible(this.contactForm);
    if (!isFormVisible) {
      throw new Error('Form should handle long input gracefully');
    }
  }

  /**
   * Verify accessibility features
   */
  async verifyAccessibilityFeatures() {
    // Check for proper labels and ARIA attributes
    await this.assertElementVisible(this.nameInput, 'Name input should be accessible');
    await this.assertElementVisible(this.emailInput, 'Email input should be accessible');
    await this.assertElementVisible(this.commentInput, 'Comment input should be accessible');
    await this.assertElementVisible(this.sendMessageButton, 'Send button should be accessible');
    
    // Check if form elements are keyboard navigable
    const isNameEnabled = await this.isElementEnabled(this.nameInput);
    const isEmailEnabled = await this.isElementEnabled(this.emailInput);
    const isCommentEnabled = await this.isElementEnabled(this.commentInput);
    const isButtonEnabled = await this.isElementEnabled(this.sendMessageButton);
    
    if (!isNameEnabled || !isEmailEnabled || !isCommentEnabled || !isButtonEnabled) {
      throw new Error('All form elements should be enabled and accessible');
    }
  }
} 