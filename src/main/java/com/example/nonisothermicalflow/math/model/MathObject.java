package com.example.nonisothermicalflow.math.model;

public class MathObject {
    private double W; //weight
    private double H; //height
    private double L; //length

    private double density;
    private double specificHeatCapacity;
    private double glassTransitionTemperature;
    private double meltingPoint;

    private double capSpeed;
    private double capTemperature;

    private double coefficientOfConsistency;
    private double firstConstantVLF;
    private double secondConstantVLF;
    private double castingTemperature;
    private double materialFlowIndex;
    private double coefficientHeatTransfer;

    private double calculationStep;


    private double calculateC2(double secondConstantVLF, double castingTemperature, double glassTransitionTemperature){
        return secondConstantVLF + castingTemperature - glassTransitionTemperature;
    }

    private double calculateC1(double firstConstantVLF, double secondConstantVLF, double C2){
        return firstConstantVLF * secondConstantVLF / C2;
    }

    private double calculateF(double H, double W){
        return 0.125 * Math.pow((H / W), 2) - 0.625 * (H / W) + 1;
    }

    private double calculateQCH(double H, double W, double capSpeed, double F){
        return (H * W * capSpeed) / 2 * F;
    }

    private double calculateGamma(double capSpeed, double H){
        return capSpeed / H;
    }

    private double calculateQγ(double H, double W, double coefficientOfConsistency, double gamma, double materialFlowIndex){
        return H * W * coefficientOfConsistency * Math.pow(gamma, materialFlowIndex + 1);
    }

    private double calculateQα(double W, double coefficientHeatTransfer, double capTemperature){
        return W * coefficientHeatTransfer * capTemperature;
    }

    private double calculateN(double L, double calculationStep){
        return (int) Math.round(L / calculationStep);
    }

    private double calculateB(double secondConstantVLF, double firstConstantVLF, double T, double castingTemperature){
        return firstConstantVLF / secondConstantVLF + (T - castingTemperature);
    }

    private double calculateT(double meltingPoint, double glassTransitionTemperature){
        return (meltingPoint + (glassTransitionTemperature + 100)) / 2;
    }

    private double calculeteXi(
            double b, double qγ, double W, double qα,
            double coefficientHeatTransfer, double castingTemperature, double meltingPoint,
            double zi, double density, double specificHeatCapacity, double QCH) {
            double numerator1 = b * qγ + W * coefficientHeatTransfer;
            double denominator1 = W * (1 + b * castingTemperature) * coefficientHeatTransfer - b * qα;
            double exp1 = Math.exp(-denominator1 * zi / (density * specificHeatCapacity * QCH));

            double part1 = (numerator1 / denominator1) * (1 - exp1);

            double innerW = W * ((1 / b + castingTemperature ) * coefficientHeatTransfer - qα);
            double exp2 = Math.exp(b*(meltingPoint-castingTemperature-(innerW * zi / (density * specificHeatCapacity * QCH))));

            return part1 + exp2;
    }
}

