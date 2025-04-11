package com.studyapp.be;

import org.springframework.data.domain.Sort;

public class Utils {
    public static Sort parseSort(String[] sortParams) {
        Sort sort = Sort.unsorted();
        if (!sortParams[0].contains(",")) {
            String field = sortParams[0];
            String direction = sortParams[1].toLowerCase();
            Sort.Order order = direction.equals("desc") ? Sort.Order.desc(field) : Sort.Order.asc(field);
            sort = sort.and(Sort.by(order));
            return sort;
        }
        for (String param : sortParams) {
            String[] fieldAndDirection = param.split(",");
            if (fieldAndDirection.length == 2) {
                String field = fieldAndDirection[0];
                String direction = fieldAndDirection[1].toLowerCase();
                Sort.Order order = direction.equals("desc") ? Sort.Order.desc(field) : Sort.Order.asc(field);
                sort = sort.and(Sort.by(order));
            }
        }
        return sort;
    }
}
