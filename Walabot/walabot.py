from __future__ import print_function
from sys import platform
from os import system
from imp import load_source
WalabotAPI = load_source('WalabotAPI', 'C:\\Program Files\\Walabot\\WalabotSDK\\python\\WalabotAPI.py')
import socket, sys

if __name__ == '__main__':
    WalabotAPI.Init()  # load the WalabotSDK to the Python wrapper	
    WalabotAPI.SetSettingsFolder()  # set the path to the essetial database files
    WalabotAPI.ConnectAny()  # establishes communication with the Walabot
    WalabotAPI.SetProfile(WalabotAPI.PROF_SENSOR)  # set scan profile out of the possibilities
    WalabotAPI.SetThreshold(35)
    WalabotAPI.SetArenaR(50,400,4)
    WalabotAPI.SetArenaPhi(-45,45,2)
    WalabotAPI.SetArenaTheta(-20,20,10)
    WalabotAPI.SetDynamicImageFilter(WalabotAPI.FILTER_TYPE_MTI)  # specify filter to use
    WalabotAPI.Start()  # starts Walabot in preparation for scanning
    system('cls' if platform == 'win32' else 'clear')  # clear the terminal
    numOfTargetsToDisplay = 1
    if len(sys.argv) == 2:
    	TCP_IP = '127.0.0.1'
    	TCP_PORT = int(sys.argv[1])
    	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    	s.bind((TCP_IP, TCP_PORT))
    	s.listen(1)
    	conn, addr = s.accept()			
    	while True:
    		WalabotAPI.Trigger()  # initiates a scan and records signals
    		targets = WalabotAPI.GetSensorTargets()  # provides a list of identified targets
    		finds = '{"targets": ['
    		index = 0
    		for i, t in enumerate(targets):
    			if i < numOfTargetsToDisplay:
    				index += 1
    				print('Target {}\nx = {}\ny = {}\nz = {}\n'.format(i+1, t.xPosCm, t.yPosCm, t.zPosCm))
    				finds += '{"x": "%s", "y": "%s", "z": "%s"}' % (t.xPosCm, t.yPosCm, t.zPosCm)
    				#if index < len(targets):
    				#	finds += ','												
    		finds += ']}'
    		conn.sendall(str.encode(finds))			
    	conn.close()
    	WalabotAPI.Stop()  # stops Walabot when finished scanning
    	WalabotAPI.Disconnect()  # stops communication with Walabot