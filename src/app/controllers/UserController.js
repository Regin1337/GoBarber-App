import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  // Route for user creation
  async store(req, res) {
    // Schema validation for data in body
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    // If validation fails, an error is returned
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Find in database if user exists
    const userExists = await User.findOne({ where: { email: req.body.email } });

    // If user exists, an error is returned
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // User creation
    const { id, name, email, provider } = await User.create(req.body);

    // Return json with user's info
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    // Schema validation for data in body
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        // Checks if oldPassword is filled, if it is filled, then password is required
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      // If password is filled, confirmPassword will be required, and will ...
      // ... check if content in confirmPassword is the same in password
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    // If validation fails, an error is returned
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = req.body;

    // Find user in database with user's id
    const user = await User.findByPk(req.userId);

    // If email is present in req.body, this condition checks if email he ...
    // ... wants to update is diferent that user already has
    if (email && email !== user.email) {
      // Find in database if user exists
      const userExists = await User.findOne({ where: { email } });

      // If user exists, an error is returned
      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // If oldPassword is present in req.body, this condition checks if ...
    // ... oldPassword is the same to the current user's password
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);

    // Return json with user's info
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
