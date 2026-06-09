package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByUserDetailsEmail(email);
    }

    @Override
    public User saveUser(User user) {
        user.setActive(1);
        UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        if (role == null) {
            role = new UserRole();
            role.setRoleName("ROLE_USER");
            role = userRoleRepository.save(role);
        }
        user.setRole(role);
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        return userRepository.save(user);
    }

    @jakarta.annotation.PostConstruct
    public void initData() {
        createRoleIfNotExist("ROLE_ADMIN");
        createRoleIfNotExist("ROLE_STAFF");
        createRoleIfNotExist("ROLE_USER");

        // Tạo tài khoản admin mặc định
        if (userRepository.findByUserName("admin") == null) {
            User admin = new User();
            admin.setUserName("admin");
            admin.setUserPassword(passwordEncoder.encode("123456"));
            admin.setActive(1);
            
            UserRole adminRole = userRoleRepository.findUserRoleByRoleName("ROLE_ADMIN");
            admin.setRole(adminRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Quản lý");
            details.setLastName("Admin");
            details.setEmail("admin@mykingdom.com");
            admin.setUserDetails(details);
            
            userRepository.save(admin);
            System.out.println(">>> Đã khởi tạo tài khoản admin mặc định (admin/123456)");
        }

        // Tạo tài khoản staff mặc định
        if (userRepository.findByUserName("staff") == null) {
            User staff = new User();
            staff.setUserName("staff");
            staff.setUserPassword(passwordEncoder.encode("123456"));
            staff.setActive(1);
            
            UserRole staffRole = userRoleRepository.findUserRoleByRoleName("ROLE_STAFF");
            staff.setRole(staffRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Nhân viên");
            details.setLastName("Staff");
            details.setEmail("staff@mykingdom.com");
            staff.setUserDetails(details);
            
            userRepository.save(staff);
            System.out.println(">>> Đã khởi tạo tài khoản staff mặc định (staff/123456)");
        }
    }

    private void createRoleIfNotExist(String roleName) {
        UserRole role = userRoleRepository.findUserRoleByRoleName(roleName);
        if (role == null) {
            role = new UserRole();
            role.setRoleName(roleName);
            userRoleRepository.save(role);
        }
    }
}
