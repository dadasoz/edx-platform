"""
Commerce-related models.
"""
from django.db import models
from django.utils.translation import ugettext_lazy as _

from config_models.models import ConfigurationModel


class CommerceConfiguration(ConfigurationModel):
    """ Commerce configuration """

    class Meta(object):
        app_label = "commerce"

    CACHE_KEY = 'commerce.api.data'
    CACHE_TTL = 3600

    checkout_on_ecommerce_service = models.BooleanField(
        default=False,
        help_text=_('Use the checkout page hosted by the E-Commerce service.')
    )

    single_course_checkout_page = models.CharField(
        max_length=255,
        default='/basket/single-item/',
        help_text=_('Path to single course checkout page hosted by the E-Commerce service.')
    )

    def __unicode__(self):
        return "Commerce configuration"
