# Courier Craft

## 🌐 Live URL

https://couriercraft-api.vercel.app/

## 📖 Project Overview

The **Courier Craft** is designed to manage parcel logistics efficiently.

It follows a **multi-rider hub-based delivery model**, where:

- A **pickup rider** collects the parcel from the sender's hub.

- A **delivery rider** delivers it from the receiver's hub.

- The system supports **status-based workflow control** — senders can request cancellations for pending parcels, while riders handle deliveries.

The platform ensures role-based permissions:

- **User** → As a sender can create parcel, request cancellation (only when status is `Pending`), track a parcel. As a receiver can view the upcoming parcels and track a parcel.

- **Rider** → Handle delivery statuses (`Out for Delivery`, `Delivered`).

- **Admin** → Works on User Management, Manage parcels, approve/reject cancellations.

- **Super Admin** → Works same as Admin

## 🚀 Features

- **Role-based operations** for User, Rider, and Admin.

- **Dynamic status update rules** depending on parcel state.

- **Hub-based routing** for multi-step delivery.

- **Rider availability checks** before assigning.

- **Secure sender identification** from parcel data.

- **REST API** with clear request/response handling.

## ⚙️ Tech Stack

**Backend:**

- Node.js

- Express.js

- MongoDB (Mongoose)

**Other Tools:**

- JWT Authentication

- dotenv for environment configs

- Passportjs used for Local and Google Authentication

- Postman for API Testing

## 📌 API Endpoints

### User

**1. Create New User:** Create new user for the application

_API Endpoint (Method):_ `/api/v1/user/register` (POST)

_Request:_

```
{
	"name":  "Khaled",
	"email":  "khaled@gmail.com",
	"password":  "Abc1234!"
}
```

_Response:_

```
{
    "statusCode": 201,
    "success": true,
    "message": "User created successfully",
    "data": {
        "name": "Khaled",
        "email": "khaled@gmail.com",
        "role": "USER",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "khaled@gmail.com"
            }
        ],
        "_id": "6898c551cf322702b2c41f69",
        "address": [],
        "createdAt": "2025-08-10T16:14:09.904Z",
        "updatedAt": "2025-08-10T16:14:09.904Z"
    }
}
```

**2. View All Users:** An admin or super admin can view all the users who have registered in the application. Only Admin and Super Admin can view the users list, any other user can not view the list

_API Endpoint (Method):_ `/api/v1/user/all-users` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
        {
            "_id": "6898c551cf322702b2c41f69",
            "name": "Khaled",
            "email": "khaled@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "khaled@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-10T16:14:09.904Z",
            "updatedAt": "2025-08-10T16:14:09.904Z"
        },
        {
            "_id": "68920b72e708828db90ece19",
            "name": "Rubel",
            "email": "rubel@gmail.com",
            "role": "RIDER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "rubel@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-05T13:47:30.835Z",
            "updatedAt": "2025-08-05T13:50:12.260Z",
            "phone": "+8801700000005",
            "riderProfile": {
                "vehicleType": "Bicycle",
                "vehicleNumber": "N/A",
                "licenseNumber": "N/A",
                "assignedHub": "6891f50d38d4942538b8e3b6",
                "availabilityStatus": "Available",
                "_id": "68920c14e708828db90ece25"
            }
        },
        {
            "_id": "68920b68e708828db90ece17",
            "name": "Polash",
            "email": "polash@gmail.com",
            "role": "RIDER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "polash@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-05T13:47:20.114Z",
            "updatedAt": "2025-08-05T13:52:35.353Z",
            "phone": "+8801700000004",
            "riderProfile": {
                "vehicleType": "Motorbike",
                "vehicleNumber": "DHAKA-METRO-LA-9999",
                "licenseNumber": "DL1111222233",
                "assignedHub": "6891f54b38d4942538b8e3b9",
                "availabilityStatus": "Available",
                "_id": "68920ca3e708828db90ece28"
            }
        },
        {
            "_id": "68920b58e708828db90ece15",
            "name": "Kamal",
            "email": "kamal@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "kamal@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-05T13:47:04.308Z",
            "updatedAt": "2025-08-05T13:47:04.308Z"
        },
        {
            "_id": "68920b4ce708828db90ece13",
            "name": "Shahjahan",
            "email": "shahjahan@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "shahjahan@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-05T13:46:52.061Z",
            "updatedAt": "2025-08-05T13:46:52.061Z"
        },
        {
            "_id": "68920b3ee708828db90ece11",
            "name": "Selim",
            "email": "selim@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "selim@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-05T13:46:38.131Z",
            "updatedAt": "2025-08-05T13:46:38.131Z"
        },
        {
            "_id": "6891a7fd51adf1d9255dab3b",
            "name": "Ahmad Subaktagin Jabir",
            "email": "jabir@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "jabir@gmail.com"
                }
            ],
            "address": [
                {
                    "label": "OFFICE",
                    "addressLine": "BCIC Bhaban",
                    "area": "Motijheel",
                    "city": "Dhaka",
                    "postalCode": "1000",
                    "country": "Bangladesh",
                    "isDefault": false,
                    "_id": "6891a81d51adf1d9255dab3f"
                },
                {
                    "label": "HOME",
                    "addressLine": "Kafrul-15",
                    "area": "Mirpur",
                    "city": "Dhaka",
                    "postalCode": "1206",
                    "country": "Bangladesh",
                    "isDefault": false,
                    "_id": "6891a9081bc2cb1c5175afbc"
                }
            ],
            "createdAt": "2025-08-05T06:43:09.836Z",
            "updatedAt": "2025-08-06T17:21:29.179Z",
            "phone": "+8801700000001"
        },
        {
            "_id": "6891844aee059586287c9da8",
            "name": "Jawad",
            "email": "jawad@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "jawad@gmail.com"
                }
            ],
            "address": [
                {
                    "label": "HOME",
                    "addressLine": "36/6 Gopibagh",
                    "area": "Motijheel",
                    "city": "Dhaka",
                    "postalCode": "1000",
                    "country": "Bangladesh",
                    "isDefault": false,
                    "_id": "6891a64aa1ae81b46dbca3f9"
                },
                {
                    "label": "OFFICE",
                    "addressLine": "BCIC Bhaban",
                    "area": "Motijheel",
                    "city": "Dhaka",
                    "postalCode": "1000",
                    "country": "Bangladesh",
                    "isDefault": false,
                    "_id": "6891a6fb6844f16238cc8971"
                }
            ],
            "createdAt": "2025-08-05T04:10:50.784Z",
            "updatedAt": "2025-08-06T17:22:21.979Z",
            "phone": "+8801700000002"
        },
        {
            "_id": "68918288a93a0a7a2cd6e5c5",
            "name": "Super Admin",
            "email": "super@gmail.com",
            "isVerified": true,
            "role": "SUPER_ADMIN",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "super@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-05T04:03:20.587Z",
            "updatedAt": "2025-08-05T04:03:20.587Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 9,
        "totalPage": 1
    }
}
```

**3. Add Addresses:** A user can add addresses against his information. Only normal users can have this authority. Some validations like a user can add only one address against _HOME_ and _OFFICE_ label, and can add as many as address against _OTHER_ label.

_API Endpoint (Method):_ `/api/v1/user/addresses` (POST)

_Request:_

```
{
	"address":  {
		"label":  "HOME",
		"addressLine":  "Mouchak Market",
		"area":  "Malibagh",
		"city":  "Dhaka",
		"postalCode":  "1216",
		"country":  "Bangladesh"
	}
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Address added successfully",
    "data": {
        "_id": "6898c551cf322702b2c41f69",
        "name": "Khaled",
        "email": "khaled@gmail.com",
        "role": "USER",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "khaled@gmail.com"
            }
        ],
        "createdAt": "2025-08-10T16:14:09.904Z",
        "updatedAt": "2025-08-10T16:22:50.596Z",
        "address": [
            {
                "label": "HOME",
                "addressLine": "Mouchak Market",
                "area": "Malibagh",
                "city": "Dhaka",
                "postalCode": "1216",
                "country": "Bangladesh",
                "isDefault": false,
                "_id": "6898c75ad5045fc0b6ee7fab"
            }
        ]
    }
}
```

**4. Update User Profile:** User profile can be updated here. Some validations like Role/Is Verified/Is Deleted etc will be handled by Admin/Super Admin. Only admin has the authority to add or update a rider profile and a super admin can make another user super admin. Rest information can be updated by self-edit, but user must have to be authenticated user.

_API Endpoint (Method):_ `/api/v1/user/:id` (PATCH)

_Request:_

```
{
	"name":  "Khaled Ahmed",
	"phone":  "+8801900000001"
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "User updated successfully",
    "data": {
        "_id": "6898c551cf322702b2c41f69",
        "name": "Khaled Ahmed",
        "email": "khaled@gmail.com",
        "role": "USER",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "khaled@gmail.com"
            }
        ],
        "createdAt": "2025-08-10T16:14:09.904Z",
        "updatedAt": "2025-08-10T16:25:38.875Z",
        "address": [
            {
                "label": "HOME",
                "addressLine": "Mouchak Market",
                "area": "Malibagh",
                "city": "Dhaka",
                "postalCode": "1216",
                "country": "Bangladesh",
                "isDefault": false,
                "_id": "6898c75ad5045fc0b6ee7fab"
            }
        ],
        "phone": "+8801900000001"
    }
}
```

**5. Update Rider Availability Status:** A rider can update their availability status when they go out for delivery or pickup. By this parcels will be updated as well in bulk.

_API Endpoint (Method):_ `/api/v1/user/rider/status` (PATCH)

_Request:_

```
{
    "status": "pickup"
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Rider pickup parcels updated successfully",
    "data": [
        {
            "_id": "68addad327cccbdd644f7da2",
            "trackingId": "TRK-20250826-070566",
            "sender": "6898c551cf322702b2c41f69",
            "receiver": "6891844aee059586287c9da8",
            "priority": "NORMAL",
            "pickupAddress": {
                "addressLine": "Mouchak Market",
                "area": "Malibagh",
                "city": "Dhaka",
                "postalCode": "1216",
                "country": "Bangladesh",
                "_id": "6898c75ad5045fc0b6ee7fab"
            },
            "deliveryAddress": {
                "addressLine": "36/6 Gopibagh",
                "area": "Motijheel",
                "city": "Dhaka",
                "postalCode": "1000",
                "country": "Bangladesh",
                "_id": "6891a64aa1ae81b46dbca3f9"
            },
            "parcelType": "6892404accd75063bc8317a3",
            "weight": 2,
            "deliveryFee": 80,
            "status": "APPROVED",
            "trackingLogs": [
                {
                    "status": "PENDING",
                    "updatedBy": "6898c551cf322702b2c41f69",
                    "description": "Parcel created and waiting for pickup",
                    "timestamp": "2025-08-26T16:03:31.812Z"
                },
                {
                    "status": "APPROVED",
                    "updatedBy": "68918288a93a0a7a2cd6e5c5",
                    "timestamp": "2025-08-27T15:55:58.986Z"
                }
            ],
            "createdAt": "2025-08-26T16:03:31.819Z",
            "updatedAt": "2025-08-29T13:35:44.502Z",
            "deliveryHub": "6891f58038d4942538b8e3c3",
            "deliveryRider": "68920b72e708828db90ece19",
            "pickupHub": "6891f54b38d4942538b8e3b9",
            "pickupRider": "68920b68e708828db90ece17"
        }
    ]
}
```

### Auth

**1. User Login:** User will login using email and password

_API Endpoint (Method):_ `/api/v1/auth/login` (POST)

_Request:_

```
{
	"email":  "khaled@gmail.com",
	"password":  "Abc1234!"
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "User logged in successfully",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4YzU1MWNmMzIyNzAyYjJjNDFmNjkiLCJlbWFpbCI6ImtoYWxlZEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDg0MjY2OCwiZXhwIjoxNzU0OTI5MDY4fQ.WaufvXSPmMP2f8xKly6K1XvTm1clbl0FmOJGevluhVk",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4YzU1MWNmMzIyNzAyYjJjNDFmNjkiLCJlbWFpbCI6ImtoYWxlZEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDg0MjY2OCwiZXhwIjoxNzU3NDM0NjY4fQ.mFZs6W_dAJBs60FtA6r1VsDgANVPQeWqZcTnOp9wFbU",
        "user": {
            "_id": "6898c551cf322702b2c41f69",
            "name": "Khaled",
            "email": "khaled@gmail.com",
            "role": "USER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "khaled@gmail.com"
                }
            ],
            "address": [],
            "createdAt": "2025-08-10T16:14:09.904Z",
            "updatedAt": "2025-08-10T16:14:09.904Z"
        }
    }
}
```

**2. Get New Access Token:** User can get new access token

_API Endpoint (Method):_ `/api/v1/auth/refresh-token` (POST)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "New access token generated successfully",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4YzU1MWNmMzIyNzAyYjJjNDFmNjkiLCJlbWFpbCI6ImtoYWxlZEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDg0MzQ1MywiZXhwIjoxNzU0OTI5ODUzfQ.-gXXrM95rB2N1zL1I5-d2Uni-IW1f2VvmbuYntNCMNc"
    }
}
```

**3. Reset Password:** User can request for password reset. But it must be ensured that user is authenticated.

_API Endpoint (Method):_ `/api/v1/auth/reset-password` (POST)

_Request:_

```
{
	"oldPassword":  "Abc1234!",
	"newPassword":  "Ab@12345"
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Password reset successfully",
    "data": null
}
```

**4. Log Out:** User can logout from the application

_API Endpoint (Method):_ `/api/v1/auth/logout` (POST)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "User logged out successfully",
    "data": null
}
```

### Hub

**1. Create New Hub:** New hub can be created and admin/super admin can create a new hub.

_API Endpoint (Method):_ `/api/v1/hub/create` (POST)

_Request:_

```
{
	"name":  "Mohammadpur Hub",
	"location":  "Mohammadpur",
	"contactNumber":  "+8801766006600",
	"coveredArea":  [
		"Mohammadpur",
		"Adabor",
		"Shyamoli",
		"Kallyanpur"
	]
}
```

_Response:_

```
{
    "statusCode": 201,
    "success": true,
    "message": "Hub created",
    "data": {
        "name": "Mohammadpur Hub",
        "location": "Mohammadpur",
        "contactNumber": "+8801766006600",
        "coveredArea": [
            "Mohammadpur",
            "Adabor",
            "Shyamoli",
            "Kallyanpur"
        ],
        "_id": "6899400da55c2ce42df64255",
        "__v": 0
    }
}
```

**2. Get All Hubs:** All created hubs can be retrieved by admin and super admin.

_API Endpoint (Method):_ `/api/v1/hub/list` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Hubs retrieved successfully",
    "data": [
        {
            "_id": "6891f50d38d4942538b8e3b6",
            "name": "Banani Hub",
            "location": "Banani",
            "contactNumber": "+8801711001100",
            "coveredArea": [
                "Banani",
                "Gulshan 1",
                "Gulshan 2",
                "Niketan"
            ],
            "__v": 0
        },
        {
            "_id": "6891f54b38d4942538b8e3b9",
            "name": "Dhanmondi Hub",
            "location": "Dhanmondi",
            "contactNumber": "+8801722002200",
            "coveredArea": [
                "Dhanmondi",
                "Kalabagan",
                "Elephant Road",
                "New Market"
            ],
            "__v": 0
        },
        {
            "_id": "6891f55838d4942538b8e3bc",
            "name": "Uttara Hub",
            "location": "Uttara Sector 7",
            "contactNumber": "+8801733003300",
            "coveredArea": [
                "Uttara Sector 3",
                "Sector 5",
                "Sector 7",
                "Sector 13",
                "Azampur"
            ],
            "__v": 0
        },
        {
            "_id": "6891f56a38d4942538b8e3bf",
            "name": "Mirpur Hub",
            "location": "Mirpur 10",
            "contactNumber": "+8801744004400",
            "coveredArea": [
                "Mirpur 1",
                "Mirpur 2",
                "Mirpur 10",
                "Kazipara",
                "Shewrapara"
            ],
            "__v": 0
        },
        {
            "_id": "6891f58038d4942538b8e3c3",
            "name": "Motijheel Hub",
            "location": "Shapla Chattar",
            "contactNumber": "+8801755005500",
            "coveredArea": [
                "Motijheel",
                "Dilkusha",
                "Paltan",
                "Shapla Chattar",
                "Arambagh"
            ],
            "__v": 0
        },
        {
            "_id": "6899400da55c2ce42df64255",
            "name": "Mohammadpur Hub",
            "location": "Mohammadpur",
            "contactNumber": "+8801766006600",
            "coveredArea": [
                "Mohammadpur",
                "Adabor",
                "Shyamoli",
                "Kallyanpur"
            ],
            "__v": 0
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 6,
        "totalPage": 1
    }
}
```

**3. Update Hub:** Existing hub can be updated by admin/super admin.

_API Endpoint (Method):_ `/api/v1/hub/update/:id` (PATCH)

_Request:_

```
{
	"location":  "Tajmahal Road"
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Hub updated successfully",
    "data": {
        "_id": "6899400da55c2ce42df64255",
        "name": "Mohammadpur Hub",
        "location": "Tajmahal Road",
        "contactNumber": "+8801766006600",
        "coveredArea": [
            "Mohammadpur",
            "Adabor",
            "Shyamoli",
            "Kallyanpur"
        ],
        "__v": 0
    }
}
```

**4. Find Riders by Hub:** Admin/Super Admin can view all riders that are specifically assigned to one hub.

_API Endpoint (Method):_ `/api/v1/hub/riders/:id` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Riders retrieved successfully",
    "data": {
        "hub": {
            "_id": "6891f54b38d4942538b8e3b9",
            "name": "Dhanmondi Hub",
            "location": "Dhanmondi",
            "contactNumber": "+8801722002200",
            "coveredArea": [
                "Dhanmondi",
                "Kalabagan",
                "Elephant Road",
                "New Market"
            ],
            "__v": 0
        },
        "riders": [
            {
                "_id": "68920b68e708828db90ece17",
                "name": "Polash",
                "email": "polash@gmail.com",
                "role": "RIDER",
                "auths": [
                    {
                        "provider": "credentials",
                        "providerId": "polash@gmail.com"
                    }
                ],
                "address": [],
                "createdAt": "2025-08-05T13:47:20.114Z",
                "updatedAt": "2025-08-05T13:52:35.353Z",
                "phone": "+8801700000004",
                "riderProfile": {
                    "vehicleType": "Motorbike",
                    "vehicleNumber": "DHAKA-METRO-LA-9999",
                    "licenseNumber": "DL1111222233",
                    "assignedHub": "6891f54b38d4942538b8e3b9",
                    "availabilityStatus": "Available",
                    "_id": "68920ca3e708828db90ece28"
                }
            }
        ]
    }
}
```

### Fee Config

**1. Create New Fee Config:** New fee config can be added by admin/super admin. Fee Config can be made for specific product types like `PACKAGE`, `FRAGILE`, `DOCUMENT`, `OTHER`

_API Endpoint (Method):_ `/api/v1/fee-config/create` (POST)

_Request:_

```
{
	"parcelType":  "OTHER",
	"feeType":  "FIXED",
	"baseFee":  40
}
```

_Response:_

```
{
    "statusCode": 201,
    "success": true,
    "message": "Fee Config created",
    "data": {
        "parcelType": "OTHER",
        "feeType": "FIXED",
        "baseFee": 40,
        "_id": "68994673a55c2ce42df64260",
        "createdAt": "2025-08-11T01:25:07.638Z",
        "updatedAt": "2025-08-11T01:25:07.638Z"
    }
}
```

**2. Get All Fee Configs:** All created fee-configs can be retrieved by admin and super admin.

_API Endpoint (Method):_ `/api/v1/fee-config/list` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Fee Configs retrieved successfully",
    "data": [
        {
            "_id": "68994673a55c2ce42df64260",
            "parcelType": "OTHER",
            "feeType": "FIXED",
            "baseFee": 40,
            "createdAt": "2025-08-11T01:25:07.638Z",
            "updatedAt": "2025-08-11T01:25:07.638Z"
        },
        {
            "_id": "6892404accd75063bc8317a3",
            "parcelType": "PACKAGE",
            "feeType": "WEIGHT_BASED",
            "baseFee": 40,
            "weightRate": 20,
            "createdAt": "2025-08-05T17:32:58.257Z",
            "updatedAt": "2025-08-05T17:32:58.257Z"
        },
        {
            "_id": "68924025ccd75063bc83179f",
            "parcelType": "FRAGILE",
            "feeType": "WEIGHT_BASED",
            "baseFee": 60,
            "weightRate": 30,
            "createdAt": "2025-08-05T17:32:21.992Z",
            "updatedAt": "2025-08-05T17:32:21.992Z"
        },
        {
            "_id": "68923fddccd75063bc83179b",
            "parcelType": "DOCUMENT",
            "feeType": "FIXED",
            "baseFee": 50,
            "createdAt": "2025-08-05T17:31:09.216Z",
            "updatedAt": "2025-08-05T17:31:09.216Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 4,
        "totalPage": 1
    }
}
```

### Parcel

**1. Create New Parcel Request:** User (Sender) can request for a parcel delivery mentioning the receiver, delivery address, pickup address, parcel type etc.

_API Endpoint (Method):_ `/api/v1/parcel/create` (POST)

_Request:_

```
{
    "receiver": "6891844aee059586287c9da8",
    "pickUpAddressId": "6898c75ad5045fc0b6ee7fab",
    "deliveryAddressId": "6891a64aa1ae81b46dbca3f9",
    "parcelType": "PACKAGE",
    "weight": 2
}
```

_Response:_

```
{
    "statusCode": 201,
    "success": true,
    "message": "Parcel requested successfully",
    "data": {
        "trackingId": "TRK-20250826-070566",
        "sender": "6898c551cf322702b2c41f69",
        "receiver": "6891844aee059586287c9da8",
        "priority": "NORMAL",
        "pickupAddress": {
            "addressLine": "Mouchak Market",
            "area": "Malibagh",
            "city": "Dhaka",
            "postalCode": "1216",
            "country": "Bangladesh",
            "_id": "6898c75ad5045fc0b6ee7fab"
        },
        "deliveryAddress": {
            "addressLine": "36/6 Gopibagh",
            "area": "Motijheel",
            "city": "Dhaka",
            "postalCode": "1000",
            "country": "Bangladesh",
            "_id": "6891a64aa1ae81b46dbca3f9"
        },
        "parcelType": "6892404accd75063bc8317a3",
        "weight": 2,
        "deliveryFee": 80,
        "status": "PENDING",
        "trackingLogs": [
            {
                "status": "PENDING",
                "updatedBy": "6898c551cf322702b2c41f69",
                "description": "Parcel created and waiting for pickup",
                "timestamp": "2025-08-26T16:03:31.812Z"
            }
        ],
        "_id": "68addad327cccbdd644f7da2",
        "createdAt": "2025-08-26T16:03:31.819Z",
        "updatedAt": "2025-08-26T16:03:31.819Z"
    }
}
```

**2. Track a Parcel:** A Parcel can be tracked by the Sender and Receiver using Tracking ID. Any user other than the sender or receiver of the parcel or Admin or Super Admin or Assigned Riders can not access the data.

_API Endpoint (Method):_ `/api/v1/parcel/track/:trackingId` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Parcel Tracking Done successfully",
    "data": {
        "_id": "68addad327cccbdd644f7da2",
        "trackingId": "TRK-20250826-070566",
        "sender": {
            "_id": "6898c551cf322702b2c41f69",
            "name": "Khaled Ahmed",
            "phone": "+8801900000001"
        },
        "receiver": {
            "_id": "6891844aee059586287c9da8",
            "name": "Jawad",
            "phone": "+8801700000002"
        },
        "priority": "NORMAL",
        "pickupAddress": {
            "addressLine": "Mouchak Market",
            "area": "Malibagh",
            "city": "Dhaka",
            "postalCode": "1216",
            "country": "Bangladesh",
            "_id": "6898c75ad5045fc0b6ee7fab"
        },
        "deliveryAddress": {
            "addressLine": "36/6 Gopibagh",
            "area": "Motijheel",
            "city": "Dhaka",
            "postalCode": "1000",
            "country": "Bangladesh",
            "_id": "6891a64aa1ae81b46dbca3f9"
        },
        "parcelType": "6892404accd75063bc8317a3",
        "weight": 2,
        "deliveryFee": 80,
        "status": "PENDING",
        "trackingLogs": [
            {
                "status": "PENDING",
                "updatedBy": "6898c551cf322702b2c41f69",
                "description": "Parcel created and waiting for pickup",
                "timestamp": "2025-08-26T16:03:31.812Z"
            }
        ],
        "createdAt": "2025-08-26T16:03:31.819Z",
        "updatedAt": "2025-08-26T16:03:31.819Z"
    }
}
```

**3. View My Sent Parcels:** User can view all the parcels they have sent.

_API Endpoint (Method):_ `/api/v1/parcel/sent/me` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "My Sent Parcels retrieved successfully",
    "data": [
        {
            "_id": "68addad327cccbdd644f7da2",
            "trackingId": "TRK-20250826-070566",
            "sender": {
                "_id": "6898c551cf322702b2c41f69",
                "name": "Khaled Ahmed",
                "phone": "+8801900000001"
            },
            "receiver": {
                "_id": "6891844aee059586287c9da8",
                "name": "Jawad",
                "phone": "+8801700000002"
            },
            "priority": "NORMAL",
            "pickupAddress": {
                "addressLine": "Mouchak Market",
                "area": "Malibagh",
                "city": "Dhaka",
                "postalCode": "1216",
                "country": "Bangladesh",
                "_id": "6898c75ad5045fc0b6ee7fab"
            },
            "deliveryAddress": {
                "addressLine": "36/6 Gopibagh",
                "area": "Motijheel",
                "city": "Dhaka",
                "postalCode": "1000",
                "country": "Bangladesh",
                "_id": "6891a64aa1ae81b46dbca3f9"
            },
            "parcelType": {
                "_id": "6892404accd75063bc8317a3",
                "parcelType": "PACKAGE"
            },
            "weight": 2,
            "deliveryFee": 80,
            "status": "PENDING",
            "trackingLogs": [
                {
                    "status": "PENDING",
                    "updatedBy": "6898c551cf322702b2c41f69",
                    "description": "Parcel created and waiting for pickup",
                    "timestamp": "2025-08-26T16:03:31.812Z"
                }
            ],
            "createdAt": "2025-08-26T16:03:31.819Z",
            "updatedAt": "2025-08-26T16:03:31.819Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "totalPage": 1
    }
}
```

**4. View My Received Parcels:** User can view all the parcels they have received or going to receive.

_API Endpoint (Method):_ `/api/v1/parcel/received/me` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "My Incoming Parcels retrieved successfully",
    "data": [
        {
            "_id": "68addad327cccbdd644f7da2",
            "trackingId": "TRK-20250826-070566",
            "sender": {
                "_id": "6898c551cf322702b2c41f69",
                "name": "Khaled Ahmed",
                "phone": "+8801900000001"
            },
            "receiver": {
                "_id": "6891844aee059586287c9da8",
                "name": "Jawad",
                "phone": "+8801700000002"
            },
            "priority": "NORMAL",
            "pickupAddress": {
                "addressLine": "Mouchak Market",
                "area": "Malibagh",
                "city": "Dhaka",
                "postalCode": "1216",
                "country": "Bangladesh",
                "_id": "6898c75ad5045fc0b6ee7fab"
            },
            "deliveryAddress": {
                "addressLine": "36/6 Gopibagh",
                "area": "Motijheel",
                "city": "Dhaka",
                "postalCode": "1000",
                "country": "Bangladesh",
                "_id": "6891a64aa1ae81b46dbca3f9"
            },
            "parcelType": {
                "_id": "6892404accd75063bc8317a3",
                "parcelType": "PACKAGE"
            },
            "weight": 2,
            "deliveryFee": 80,
            "status": "APPROVED",
            "trackingLogs": [
                {
                    "status": "PENDING",
                    "updatedBy": "6898c551cf322702b2c41f69",
                    "description": "Parcel created and waiting for pickup",
                    "timestamp": "2025-08-26T16:03:31.812Z"
                },
                {
                    "status": "APPROVED",
                    "updatedBy": "68918288a93a0a7a2cd6e5c5",
                    "timestamp": "2025-08-27T15:55:58.986Z"
                }
            ],
            "createdAt": "2025-08-26T16:03:31.819Z",
            "updatedAt": "2025-08-27T15:55:58.994Z",
            "deliveryHub": "6891f58038d4942538b8e3c3",
            "deliveryRider": "68920b72e708828db90ece19",
            "pickupHub": "6891f54b38d4942538b8e3b9",
            "pickupRider": "68920b68e708828db90ece17"
        },
        {
            "_id": "68938f55ad08deaaba65eb88",
            "trackingId": "TRK-20250806-856297",
            "sender": {
                "_id": "6891a7fd51adf1d9255dab3b",
                "name": "Ahmad Subaktagin Jabir",
                "phone": "+8801700000001"
            },
            "receiver": {
                "_id": "6891844aee059586287c9da8",
                "name": "Jawad",
                "phone": "+8801700000002"
            },
            "priority": "NORMAL",
            "pickupAddress": {
                "addressLine": "Nandon Apartment Complex",
                "area": "Mirpur",
                "city": "Dhaka",
                "postalCode": "1206",
                "country": "Bangladesh",
                "_id": "6891a9081bc2cb1c5175afbc"
            },
            "deliveryAddress": {
                "addressLine": "36/6 Gopibagh",
                "area": "Motijheel",
                "city": "Dhaka",
                "postalCode": "1000",
                "country": "Bangladesh",
                "_id": "6891a64aa1ae81b46dbca3f9"
            },
            "parcelType": {
                "_id": "6892404accd75063bc8317a3",
                "parcelType": "PACKAGE"
            },
            "weight": 2,
            "deliveryFee": 80,
            "status": "CANCELLED",
            "trackingLogs": [
                {
                    "status": "PENDING",
                    "updatedBy": "6891a7fd51adf1d9255dab3b",
                    "description": "Parcel created and waiting for pickup",
                    "timestamp": "2025-08-06T17:22:29.867Z"
                }
            ],
            "createdAt": "2025-08-06T17:22:29.877Z",
            "updatedAt": "2025-08-08T16:43:20.595Z"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "totalPage": 1
    }
}
```

**5. View My Pickup Parcels (Rider):** A rider can view all the parcels he/she have to pickup from sender.

_API Endpoint (Method):_ `/api/v1/parcel/rider/pickup/me` (GET)

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "My Pickup Parcels retrieved successfully",
    "data": [
        {
            "_id": "68addad327cccbdd644f7da2",
            "trackingId": "TRK-20250826-070566",
            "sender": {
                "_id": "6898c551cf322702b2c41f69",
                "name": "Khaled Ahmed",
                "phone": "+8801900000001"
            },
            "receiver": {
                "_id": "6891844aee059586287c9da8",
                "name": "Jawad",
                "phone": "+8801700000002"
            },
            "priority": "NORMAL",
            "pickupAddress": {
                "addressLine": "Mouchak Market",
                "area": "Malibagh",
                "city": "Dhaka",
                "postalCode": "1216",
                "country": "Bangladesh",
                "_id": "6898c75ad5045fc0b6ee7fab"
            },
            "deliveryAddress": {
                "addressLine": "36/6 Gopibagh",
                "area": "Motijheel",
                "city": "Dhaka",
                "postalCode": "1000",
                "country": "Bangladesh",
                "_id": "6891a64aa1ae81b46dbca3f9"
            },
            "parcelType": {
                "_id": "6892404accd75063bc8317a3",
                "parcelType": "PACKAGE"
            },
            "weight": 2,
            "deliveryFee": 80,
            "status": "APPROVED",
            "trackingLogs": [
                {
                    "status": "PENDING",
                    "updatedBy": "6898c551cf322702b2c41f69",
                    "description": "Parcel created and waiting for pickup",
                    "timestamp": "2025-08-26T16:03:31.812Z"
                },
                {
                    "status": "APPROVED",
                    "updatedBy": "68918288a93a0a7a2cd6e5c5",
                    "timestamp": "2025-08-27T15:55:58.986Z"
                }
            ],
            "createdAt": "2025-08-26T16:03:31.819Z",
            "updatedAt": "2025-08-27T15:55:58.994Z",
            "deliveryHub": "6891f58038d4942538b8e3c3",
            "deliveryRider": "68920b72e708828db90ece19",
            "pickupHub": "6891f54b38d4942538b8e3b9",
            "pickupRider": "68920b68e708828db90ece17"
        }
    ],
    "meta": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "totalPage": 1
    }
}
```

**7. Update Parcel:** The core component of the parcel service is based here. It includes a number of role-based logics to correctly handle the package delivery service. Following are the logics that are used here:

- **User:** Sender can Cancel a request if the Parcel sending request is `PENDING`. Otherwise, user can not cancel the request

- **Admin/Super Admin:** Admin or Super Admin can Approve or Reject Parcel Delivery Request by a User. Besides that, they can assign the pick up hub, delivery hub, pick up rider and delivery rider. Some proper validations have been added here, like properly hub and rider assign, assign rider on basis of availability etc.

- **Rider:** Rider can update the parcel delivery status into `OUT FOR DELIVERY` or `DELIVERED`.

_API Endpoint (Method)_: `/api/v1/parcel/update/:id` (PATCH)

_Request:_

```
{
    "status": "APPROVED",
    "pickupHub": "6891f54b38d4942538b8e3b9",
    "deliveryHub": "6891f58038d4942538b8e3c3",
    "pickupRider": "68920b68e708828db90ece17",
    "deliveryRider": "68920b72e708828db90ece19"
}
```

_Response:_

```
{
    "statusCode": 200,
    "success": true,
    "message": "Parcel updated successfully",
    "data": {
        "_id": "68addad327cccbdd644f7da2",
        "trackingId": "TRK-20250826-070566",
        "sender": "6898c551cf322702b2c41f69",
        "receiver": "6891844aee059586287c9da8",
        "priority": "NORMAL",
        "pickupAddress": {
            "addressLine": "Mouchak Market",
            "area": "Malibagh",
            "city": "Dhaka",
            "postalCode": "1216",
            "country": "Bangladesh",
            "_id": "6898c75ad5045fc0b6ee7fab"
        },
        "deliveryAddress": {
            "addressLine": "36/6 Gopibagh",
            "area": "Motijheel",
            "city": "Dhaka",
            "postalCode": "1000",
            "country": "Bangladesh",
            "_id": "6891a64aa1ae81b46dbca3f9"
        },
        "parcelType": "6892404accd75063bc8317a3",
        "weight": 2,
        "deliveryFee": 80,
        "status": "APPROVED",
        "trackingLogs": [
            {
                "status": "PENDING",
                "updatedBy": "6898c551cf322702b2c41f69",
                "description": "Parcel created and waiting for pickup",
                "timestamp": "2025-08-26T16:03:31.812Z"
            },
            {
                "status": "APPROVED",
                "updatedBy": "68918288a93a0a7a2cd6e5c5",
                "timestamp": "2025-08-27T15:55:58.986Z"
            }
        ],
        "createdAt": "2025-08-26T16:03:31.819Z",
        "updatedAt": "2025-08-27T15:55:58.994Z",
        "pickupHub": "6891f54b38d4942538b8e3b9",
        "deliveryHub": "6891f58038d4942538b8e3c3",
        "pickupRider": "68920b68e708828db90ece17",
        "deliveryRider": "68920b72e708828db90ece19"
    }
}
```
