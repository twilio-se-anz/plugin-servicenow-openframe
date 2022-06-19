export default {
    baseName: "FlexLight",
    colors: {
        lightTextColor: "#ffffff",
        darkTextColor: "#005bb1",
    },
    overrides: {
        MainHeader: {
            Container: {
                color: "#ffffff",
                background: "#005bb1",          
            },
            Button: {
                color: "#ffffff",
                background: "#005bb1", 
            }
        },
        SideNav: {
            Container: {
                background: "#005bb1",
            },
            Button: {
                background: "#005bb1",
                color: "#ffffff"
            },
            Icon: {
                color: "#ffffff"
            }
        },

        TaskCanvasHeader: {
            WrapupTaskButton: {
                background: "#005bb1",
                color: "#ffffff",
            },
            EndTaskButton: {
                background: "#da192e",
                color: "#ffffff",
            }
        },
    }
    
}