# -*- coding: utf-8 -*-
"""
@author: hadam1993
"""

import cv2
import numpy as np

def green_veg_filter(img):
    saturation_coef = 1.6
    variation_coef = 4
    street_sign_coef = 0.4174*255

    HSV_img = cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
    HSV_img[:,:,1] = HSV_img[:,:,1]*saturation_coef
    
    img = cv2.cvtColor(HSV_img,cv2.COLOR_HSV2BGR)
    img = img
    
    #BGR Filter
    bgr_filter = 2*img[:,:,1]>(img[:,:,0]+img[:,:,2])*1.5
    
    localminB = cv2.erode(img[:,:,0],np.ones((5,5)))
    localmaxB = cv2.dilate(img[:,:,0],np.ones((5,5)))
    localminG = cv2.erode(img[:,:,1],np.ones((5,5)))
    localmaxG = cv2.dilate(img[:,:,1],np.ones((5,5)))
    localminR = cv2.erode(img[:,:,2],np.ones((5,5)))
    localmaxR = cv2.dilate(img[:,:,2],np.ones((5,5)))
    
    #create variation filter 1
    bool_B1 = (localmaxB-localminB )> variation_coef 
    bool_G1 = (localmaxG-localminG) > variation_coef
    bool_R1 = (localmaxR-localminR) > variation_coef
    var_filter1 = bool_B1 | bool_G1 | bool_R1
    
    #create varation filter 2
    var_filter2 = 2*img[:,:,1]>(img[:,:,0]+img[:,:,2] +2)
    
    #street sign filter
    street_sign_filt = HSV_img[:,:,2]>street_sign_coef
    
    #apply filters
    all_filters = bgr_filter & var_filter1 & var_filter2 & ~street_sign_filt
    all_filters_stack = np.stack([all_filters,all_filters,all_filters],axis=2)
    img2save = img*all_filters_stack
    return img2save