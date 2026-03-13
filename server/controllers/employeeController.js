const { Employee } = require('../models');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, position, hireDate, isActive, notes, gaji } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const employee = await Employee.create({
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      position: position || null,
      hireDate: hireDate || null,
      isActive: isActive !== undefined ? isActive : true,
      gaji: gaji || 0,
      notes: notes || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, position, hireDate, isActive, notes, gaji } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await employee.update({
      name: name !== undefined ? name : employee.name,
      email: email !== undefined ? email : employee.email,
      phone: phone !== undefined ? phone : employee.phone,
      position: position !== undefined ? position : employee.position,
      hireDate: hireDate !== undefined ? hireDate : employee.hireDate,
      isActive: isActive !== undefined ? isActive : employee.isActive,
      gaji: gaji !== undefined && gaji !== '' ? gaji : employee.gaji,
      notes: notes !== undefined ? notes : employee.notes,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Soft delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await employee.update({ isActive: false });

    return res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

