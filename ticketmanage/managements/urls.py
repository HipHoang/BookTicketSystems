from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('companies', views.CompanyViewSet, basename='company')
router.register('buses', views.BusViewSet, basename='bus')
router.register('routes', views.RouteViewSet, basename='route')
router.register('reservations', views.ReservationViewSet, basename='reservation')
router.register('stops', views.StopViewSet, basename='stop')
router.register('schedules', views.ScheduleViewSet, basename='schedule')
router.register('seats', views.SeatViewSet, basename='seat')
router.register('payments', views.PaymentViewSet, basename='payment')
router.register('promotions', views.PromotionViewSet, basename='promotion')
router.register('promotion-usages', views.PromotionUsageViewSet, basename='promotion-usage')
router.register('driver-assignments', views.DriverAssignmentViewSet, basename='driver-assignment')
router.register('drivers', views.DriverViewSet, basename='driver')
router.register('reviews', views.ReviewViewSet, basename='review')
router.register('notifications', views.NotificationViewSet, basename='notification')
router.register('gps-points', views.GPSPointViewSet, basename='gps-point')
router.register('agents', views.AgentViewSet, basename='agent')
router.register('agent-sales', views.AgentSaleViewSet, basename='agent-sale')
router.register('chat-messages', views.ChatMessageViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
    path('momo/payment/', views.momo_payment, name='momo_payment'),
    path('momo/ipn/', views.momo_ipn, name='momo_ipn'),
]
