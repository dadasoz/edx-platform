;(function (define, undefined) {
    'use strict';
    define([
        'gettext', 'jquery', 'underscore', 'backbone', 'logger',
        'js/student_account/models/user_account_model',
        'js/student_account/models/user_preferences_model',
        'js/student_account/views/account_settings_fields',
        'js/student_account/views/account_settings_view'
    ], function (gettext, $, _, Backbone, Logger, UserAccountModel, UserPreferencesModel,
                 AccountSettingsFieldViews, AccountSettingsView) {

        return function (fieldsData, authData, userAccountsApiUrl, userPreferencesApiUrl, accountUserId, platformName) {
            var accountSettingsElement, userAccountModel, userPreferencesModel, aboutSectionsData,
                accountsSectionData, ordersSectionData, accountSettingsView, showAccountSettingsPage,
                showLoadingError;

            accountSettingsElement = $('.wrapper-account-settings');

            userAccountModel = new UserAccountModel();
            userAccountModel.url = userAccountsApiUrl;

            userPreferencesModel = new UserPreferencesModel();
            userPreferencesModel.url = userPreferencesApiUrl;

            aboutSectionsData = [
                 {
                    title: gettext('Basic Account Information'),
                    subtitle: gettext(
                        'These settings include basic information about your account. You can also ' +
                        'specify additional information and see your linked social accounts on this page.'
                    ),
                    fields: [
                        {
                            view: new AccountSettingsFieldViews.ReadonlyFieldView({
                                model: userAccountModel,
                                title: gettext('Username'),
                                valueAttribute: 'username',
                                helpMessage: interpolate_text(
                                    gettext('The name that identifies you throughout {platform_name}. You cannot change your username.'), {platform_name: platformName}
                                )
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.TextFieldView({
                                model: userAccountModel,
                                title: gettext('Full Name'),
                                valueAttribute: 'name',
                                helpMessage: gettext(
                                    'The name that is used for ID verification and appears on your certificates. Other learners never see your full name. Make sure to enter your name exactly as it appears on your government-issued photo ID, including any non-Roman characters.' /* jshint ignore:line */
                                ),
                                persistChanges: true
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.EmailFieldView({
                                model: userAccountModel,
                                title: gettext('Email Address'),
                                valueAttribute: 'email',
                                helpMessage: interpolate_text(
                                    gettext('The email address you use to sign in. Communications from {platform_name} and your courses are sent to this address.'), {platform_name: platformName}
                                ),
                                persistChanges: true
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.PasswordFieldView({
                                model: userAccountModel,
                                title: gettext('Password'),
                                screenReaderTitle: gettext('Reset Your Password'),
                                valueAttribute: 'password',
                                emailAttribute: 'email',
                                linkTitle: gettext('Reset Your Password'),
                                linkHref: fieldsData.password.url,
                                helpMessage: gettext('When you click "Reset Your Password", edX will send a message ' +
                                    'to the email address for your edX account. Click the link in the message to ' +
                                    'reset your password.')
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.LanguagePreferenceFieldView({
                                model: userPreferencesModel,
                                title: gettext('Language'),
                                valueAttribute: 'pref-lang',
                                required: true,
                                refreshPageOnSave: true,
                                helpMessage: interpolate_text(
                                    gettext('The language used throughout this site. This site is currently available in a limited number of languages.'), {platform_name: platformName}
                                ),
                                options: fieldsData.language.options,
                                persistChanges: true
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.DropdownFieldView({
                                model: userAccountModel,
                                required: true,
                                title: gettext('Country or Region'),
                                valueAttribute: 'country',
                                options: fieldsData.country.options,
                                persistChanges: true
                            })
                        }
                    ]
                },
                {
                    title: gettext('Additional Information'),
                    fields: [
                        {
                            view: new AccountSettingsFieldViews.DropdownFieldView({
                                model: userAccountModel,
                                title: gettext('Education Completed'),
                                valueAttribute: 'level_of_education',
                                options: fieldsData.level_of_education.options,
                                persistChanges: true
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.DropdownFieldView({
                                model: userAccountModel,
                                title: gettext('Gender'),
                                valueAttribute: 'gender',
                                options: fieldsData.gender.options,
                                persistChanges: true
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.DropdownFieldView({
                                model: userAccountModel,
                                title: gettext('Year of Birth'),
                                valueAttribute: 'year_of_birth',
                                options: fieldsData.year_of_birth.options,
                                persistChanges: true
                            })
                        },
                        {
                            view: new AccountSettingsFieldViews.LanguageProficienciesFieldView({
                                model: userAccountModel,
                                title: gettext('Preferred Language'),
                                valueAttribute: 'language_proficiencies',
                                options: fieldsData.preferred_language.options,
                                persistChanges: true
                            })
                        }
                    ]
                }
            ];

            accountsSectionData = [
                {
                    title: gettext('Linked Accounts'),
                    subtitle: gettext(
                        'You can link your social media accounts to your edX account to make signing in to edx.org ' +
                        'and the edX mobile apps easier.'
                    ),
                    fields: _.map(authData.providers, function(provider) {
                        return {
                            'view': new AccountSettingsFieldViews.AuthFieldView({
                                title: provider.name,
                                valueAttribute: 'auth-' + provider.id,
                                helpMessage: '',
                                connected: provider.connected,
                                connectUrl: provider.connect_url,
                                acceptsLogins: provider.accepts_logins,
                                disconnectUrl: provider.disconnect_url
                            })
                        };
                    })
                }
            ];

            var orderHistory = [
                {
                    'title': 'ORDER NAME',
                    'date_placed': 'DATE PLACED',
                    'total_excl_tax': 'TOTAL',
                    'number': 'INVOICE ID'
                },
               {
                  "status":"Complete",
                  "billing_address": null,
                   "title":"Seat in Receipt page with honor certificate",
                   "number":"EDX-100039",
                   "date_placed":"2016-04-21T10:26:36Z",
                   "currency":"USD",
                   "total_excl_tax":"0.00",
                   "basket":39,
                   "receipt_url":"/commerce/checkout/receipt/?basket_id=39"
               },
               {
                  "status":"Complete",
                  "billing_address": null,
                   "title":"Seat in Verifying ECOM-3829 with honor certificate",
                   "number":"EDX-100009",
                   "date_placed":"2016-03-08T07:03:41Z",
                   "currency":"USD",
                   "total_excl_tax":"0.00",
                   "basket":9,
                   "receipt_url":"/commerce/checkout/receipt/?basket_id=9"
               }
            ];

            ordersSectionData = [
                {
                    title: gettext('Your Orders'),
                    subtitle: gettext(
                        'View details of our past purchases and, potentially request a refund for a past order. For ' +
                        'more information on refund request eligibility'
                    ),
                    fields: _.map(orderHistory, function(order) {
                        return {
                            'view': new AccountSettingsFieldViews.OrderHistoryFieldView({
                                title: order.title,
                                total_price: order.total_excl_tax,
                                invoice_id: order.number,
                                date_placed: order.date_placed,
                                receipt_url: order.receipt_url,
                                valueAttribute: 'order-' + order.number
                            })
                        };
                    })
                }
            ];

            accountSettingsView = new AccountSettingsView({
                model: userAccountModel,
                accountUserId: accountUserId,
                el: accountSettingsElement,
                tabSections: {
                    aboutTabSections: aboutSectionsData,
                    accountsTabSections: accountsSectionData,
                    ordersTabSections: ordersSectionData
                },
                userPreferencesModel: userPreferencesModel
            });

            accountSettingsView.render();

            showAccountSettingsPage = function () {
                // Record that the account settings page was viewed.
                Logger.log('edx.user.settings.viewed', {
                    page: "account",
                    visibility: null,
                    user_id: accountUserId
                });

                // Render the fields
                accountSettingsView.renderFields();
            };

            showLoadingError = function () {
                accountSettingsView.showLoadingError();
            };

            userAccountModel.fetch({
                success: function () {
                    // Fetch the user preferences model
                    userPreferencesModel.fetch({
                        success: showAccountSettingsPage,
                        error: showLoadingError
                    });
                },
                error: showLoadingError
            });

            return {
                userAccountModel: userAccountModel,
                userPreferencesModel: userPreferencesModel,
                accountSettingsView: accountSettingsView
            };
        };
    });
}).call(this, define || RequireJS.define);
