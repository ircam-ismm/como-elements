#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Oct  9 18:01:12 2020

@author: bevilacq
"""

import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
# import seaborn as sns

filename = '/Users/matuszewski/work/dev/projects/como/como-elements/projects/default/recordings/20201014-164542-player-25'

# with open(filename) as data_file:
# data = pd.read_json(filename, lines = 'true')
data = []
with open(filename) as f:
    for line in f:
        data.append(json.loads(line))

dataFrame = pd.json_normalize(data)
print(dataFrame);

# metas = pd.DataFrame(data['metas'].to_list())
# acc = pd.DataFrame(data['accelerationIncludingGravity'].to_list())
# gyro = pd.DataFrame(data['rotationRate'].to_list())

# acc.insert(0, 'time', metas['time'] - metas['time'][0]) # adding time column, starting at 0
# gyro.insert(0, 'time', metas['time'] - metas['time'][0]) # adding time column

# # plot
# fig = plt.figure(1)

# # plot above
# ax1 = plt.subplot(211)
# plt.plot(acc['time'],acc['x'],'r',label = 'x')
# plt.plot(acc['time'],acc['y'],'g',label = 'y')
# plt.plot(acc['time'],acc['z'],'b',label = 'z')

# #properties
# plt.ylim(-60, 60)
# plt.title('acceleration with gravity')
# ax1.legend(loc = 1,fontsize = 'small')
# plt.setp(ax1.get_xticklabels(),visible = False ) # make these tick labels invisible

# # plot below
# ax2 = plt.subplot(212, sharex=ax1)
# plt.plot(gyro['time'],gyro['alpha'],'r',label = 'alpha')
# plt.plot(gyro['time'],gyro['beta'],'g',label = 'beta')
# plt.plot(gyro['time'],gyro['gamma'],'b',label = 'gamma')

# #properties
# plt.ylim(-1000, 1000)
# plt.title('gyroscope - rotationRate')
# ax2.legend(loc = 1, fontsize = 'small')
# plt.setp(ax2.get_xticklabels(), fontsize = 12 ) # make these tick labels visible

# # set xlim
# # plt.xlim(0.8, 12.4)

# plt.show()

# # save to file
# #fig.savefig('plot-accel-gyro.pdf')
