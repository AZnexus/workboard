package com.workboard.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping("/{path:^(?!api|actuator|assets|favicon\\.svg|icons\\.svg|index\\.html).*$}/**")
    public String forward() {
        return "forward:/index.html";
    }
}
