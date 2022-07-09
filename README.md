## How to Run 
- Open cmd and cd your project root directory
- Run `npm init`
- Run `npm run start`

## API Endpoints
| Methods        | Endpoints      | Description|
| :------------- | :---------- | :----------- |
|  `GET`  | /users  | Get all user data when logged in    |
| `POST`  | /users | Register account must given `name`,`email`,`password` & `confPassword` to body request |
| `POST`  | /login | login account must given `email` & `password` to body request |
|  `GET`  |/token   | Get refresh token   |
| `DELETE`  | /logout | Logout  |
|  `GET` | /portofolio  | Get all portofolio   |
| `GET`  | /portofolio/{id} | Get specific portofolio by giver `id`  |
