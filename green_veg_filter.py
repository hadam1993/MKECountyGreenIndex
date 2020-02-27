# -*- coding: utf-8 -*-
"""
@author: hadam1993
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
from skimage.color import rgb2hsv
from skimage.color import hsv2rgb

def green_veg_filter(img):
    saturation_coef = 1.8
    variation_coef = 4
    street_sign_coef = 0.4074
    #img = img.astype(np.float)
    orig_img = np.ones_like(img)
    orig_img = orig_img*img
    orig_img = cv2.cvtColor(orig_img, cv2.COLOR_BGR2RGB)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    HSV_img = rgb2hsv(img)
    #HSV_img = cv2.cvtColor(img,cv2.COLOR_RGB2HSV)
    #HSV_img = HSV_img.astype(np.float)
    #HSV_img = HSV_img*255.0
    #HSV_img = HSV_img.astype(np.uint8)
    HSV_img[:,:,0] = HSV_img[:,:,0]*1.0
    HSV_img[:,:,1] = HSV_img[:,:,1]*saturation_coef
    HSV_img[:,:,2] = HSV_img[:,:,2]*1.0
    img = hsv2rgb(HSV_img)
    img = img * 255.0
    img[:,:,0] = np.where(img[:,:,0]>0.0, img[:,:,0], 0.0)
    img[:,:,0] = np.round_(img[:,:,0])
    #img[:,:,0] = img[:,:,0].astype(np.uint8)
    img[:,:,1] = np.where(img[:,:,1]>0.0, img[:,:,1], 0.0)
    img[:,:,1] = np.round_(img[:,:,1])
    img[:,:,2] = np.where(img[:,:,2]>0.0, img[:,:,2], 0.0)
    img[:,:,2] = np.round_(img[:,:,2])
    #img[:,:,2] = img[:,:,2].astype(np.uint8)
    #img = img.astype(np.uint8)
    #HSV_img = HSV_img.astype(np.uint8)
    #img = cv2.cvtColor(HSV_img,cv2.COLOR_HSV2BGR)
    #img = img.astype(np.float)
    #BGR Filter
    a = 2.0*img[:,:,1]
    a = np.where(a>255.0, 255.0, a)
    b = (img[:,:,0]+img[:,:,2])*1.4
    b = np.where(b>255.0, 255.0, b)
    bgr_filter = a>b
    
    localminB = cv2.erode(img[:,:,0],np.ones((5,5)))
    localmaxB = cv2.dilate(img[:,:,0],np.ones((5,5)))
    localminG = cv2.erode(img[:,:,1],np.ones((5,5)))
    localmaxG = cv2.dilate(img[:,:,1],np.ones((5,5)))
    localminR = cv2.erode(img[:,:,2],np.ones((5,5)))
    localmaxR = cv2.dilate(img[:,:,2],np.ones((5,5)))
    
    #create variation filter 1
    bool_B1 = (localmaxB-localminB) > variation_coef 
    bool_G1 = (localmaxG-localminG) > variation_coef
    bool_R1 = (localmaxR-localminR) > variation_coef
    var_filter1 = bool_B1 | bool_G1 | bool_R1
    
    #create varation filter 2
    #var_filter2 = 2.0*orig_img[:,:,1]>(orig_img[:,:,0]+orig_img[:,:,2] +2.0)
    
    #HSV_img = cv2.cvtColor(orig_img,cv2.COLOR_BGR2HSV)
    #street sign filter
    HSV_img = rgb2hsv(orig_img)
    street_sign_filt = HSV_img[:,:,0]>street_sign_coef
    
    #apply filters
    #all_filters = bgr_filter & var_filter1 & var_filter2 & ~street_sign_filt
    all_filters = bgr_filter & var_filter1 & ~street_sign_filt
    all_filters_stack = np.stack([all_filters,all_filters,all_filters],axis=2)
    img2save = orig_img*all_filters_stack
    return img2save.astype(np.uint8)
img = cv2.imread('/home/ahonts/Desktop/GreenIndex/locations 45059-47180/Lat_43.04889367871196Lon_-87.97051796394237PAN@wgCfc2WaAIRxuonq5EBKzAHeading@60Pitch@5.jpg')
img = green_veg_filter(img)
#img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
plt.imshow(img)