from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Public access - no authentication required.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        # Send welcome email
        try:
            send_mail(
                subject='Welcome to Invento - Account Created',
                message=f'''Hello {user.first_name or user.email},

Your Invento account has been created successfully!

You can now log in and start managing your inventory.

Best regards,
The Invento Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT login view that returns user details with tokens.
    Also sends a login notification email to the user.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Send login notification email
            email = request.data.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                    login_time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                    
                    send_mail(
                        subject='Invento - Login Notification',
                        message=f'''Hello {user.first_name or user.email},

You have successfully logged into Invento.

Login Time: {login_time}
IP Address: {request.META.get('REMOTE_ADDR', 'Unknown')}

If this wasn't you, please contact support immediately.

Best regards,
The Invento Team
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=True
                    )
                except Exception as e:
                    print(f"Failed to send login notification: {e}")
        
        return response


class LogoutView(APIView):
    """
    API endpoint for user logout.
    Blacklists the refresh token to invalidate the session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    API endpoint to get/update current user profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """
    API endpoint to list all users.
    Only accessible by Admin users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


def test_email(request):
    from django.http import HttpResponse
    send_mail(
        subject='Test Email',
        message='Email setup successful!',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['jhpdjds2024@gmail.com'],
        fail_silently=False
    )
    return HttpResponse("Email sent successfully")
