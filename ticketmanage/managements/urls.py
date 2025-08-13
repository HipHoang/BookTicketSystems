from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
# router.register('activity', views.ActivityViewSet, basename='activity')
# router.register('workoutplan', views.WorkoutPlanViewSet, basename='workoutplan')
# router.register('mealplan', views.MealPlanViewSet, basename='mealplan')
# router.register('healthrecord', views.HealthRecordViewSet, basename='healthrecord')
# router.register('healthdiary', views.HealthDiaryViewSet, basename='healthdiary')
# router.register('tag', views.TagViewSet, basename='tag')
# router.register('chatmessage', views.ChatMessageViewSet, basename='chat')
# router.register('connection', views.UserConnectionViewSet, basename='connection')
# router.register('goal', views.UserGoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]