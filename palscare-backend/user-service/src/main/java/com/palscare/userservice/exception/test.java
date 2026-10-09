package com.palscare.userservice.exception;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class test {

    public static void main(String[] args) {
//   String reversal :
//   =================

//        String input = "i am good";
//        String reversestr ="";
//
//        for(int i= str.length()-1;i>=0;i--){
//            reversestr = reversestr +  str.charAt(i);
//        }
//        System.out.println(reversestr);


//        String reversed = IntStream.range(0, input.length())
//                .mapToObj(i -> String.valueOf(input.charAt(input.length() - 1 - i)))
//                .collect(Collectors.joining());
//
//        System.out.println(reversed);

//        find prime number

//        for(int number =1;number<=57890000;number++){
//            boolean isPrime = true;
//            if(number<=1){
//                isPrime = false;
//            }
//            else {
//                for(int i=2;i<=Math.sqrt(number);i++){
//                    if(number % i ==0){
//                        isPrime = false;
//                    }
//                }
//            }
//            if(isPrime){
//                System.out.println(number);
//            }
//        }

//        duplicate character and unique character
//        ===========================================
//
//String input = "programming";
//        Map<Character,Long> count = input.chars().mapToObj(c -> (char)c).
//                filter(c->c !=' ').
//                collect(Collectors.groupingBy(Function.identity(),Collectors.counting()));
//
//        count.entrySet().stream().filter(entry -> entry.getValue()>1).forEach(entry ->System.out.print(entry.getKey()));
////
////        count.entrySet().stream().filter(entry -> entry.getValue()==1).forEach(entry ->System.out.print(entry.getKey()));
//        count.forEach((ch,freq) -> System.out.println(ch + " = "+freq));

//        2nd largest, even, odd
//        ============================

//        Integer[] numbers = {10,25,5,40,38,5,15,75,15,55};
//        List<Integer> list= Arrays.asList(numbers);
//       System.out.println(list.stream().distinct().sorted((a,b)->b-a)
////               .skip(1)
//               .findFirst()
//               .orElse(null));
////                .forEach(System.out::println);

        List<Employee> employees = Arrays.asList(

                new Employee(101, "Arijit", "IT", 75000, 27),
                new Employee(102, "Rahul", "HR", 50000, 30),
                new Employee(103, "Ankit", "Finance", 90000, 35),
                new Employee(104, "Priya", "IT", 82000, 29),
                new Employee(105, "Sneha", "Sales", 50000, 26),
                new Employee(106, "Amit", "Finance", 95000, 40),
                new Employee(107, "Neha", "HR", 58000, 31),
                new Employee(108, "Rohit", "IT", 67000, 25),
                new Employee(109, "Pooja", "Sales", 72000, 33),
                new Employee(110, "Karan", "IT", 100000, 38)
        );

        Employee secondHighestSalemployee = employees.stream()
                .map(Employee::getSalary)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .skip(1)    //second largest salary
                .findFirst()
                .flatMap(secondsal -> employees.stream()
                        .filter(e->e.getSalary() == secondsal)
                        .findFirst())
                .orElse(null);

        System.out.println(secondHighestSalemployee);



}
}
