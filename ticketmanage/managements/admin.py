from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from managements.models import *

from oauth2_provider.models import AccessToken, Application


class MyAdminSite(admin.AdminSite):
    site_header = 'Health Management Administration'

class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")
    ordering = ("id",)

admin_site = MyAdminSite(name='admin')

admin_site.register(User, UserAdmin)